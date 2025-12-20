const db = require("../config/db");
const generateOTP = require("../utils/otp");
const sendEmail = require("../utils/sendEmail");

const isDevOtpEnabled = process.env.NODE_ENV !== "production";

/**
 * POST /api/auth/send-otp
 */
exports.sendOtp = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      mobileNumber,
      email,
      dateOfBirth
    } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) {
          console.error("DB select error:", err);
          return res.status(500).json({ error: "Database error" });
        }

        const isNewUser = results.length === 0;

        const query = isNewUser
          ? `
            INSERT INTO users
            (first_name, last_name, mobile_number, email, date_of_birth, otp_code, otp_expires_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `
          : `
            UPDATE users SET
              first_name = ?,
              last_name = ?,
              mobile_number = ?,
              date_of_birth = ?,
              otp_code = ?,
              otp_expires_at = ?
            WHERE email = ?
          `;

        const values = isNewUser
          ? [firstName, lastName, mobileNumber, email, dateOfBirth, otp, expiresAt]
          : [firstName, lastName, mobileNumber, dateOfBirth, otp, expiresAt, email];

        db.query(query, values, async (err) => {
          if (err) {
            console.error("DB insert/update error:", err);
            return res.status(500).json({ error: "Database write failed" });
          }

          // 🔧 DEV MODE
          if (isDevOtpEnabled) {
            console.log("🟡 DEV MODE OTP:", otp);
            return res.json({
              message: "OTP generated (development mode)",
              devOtp: otp
            });
          }

          // 🚀 PROD MODE
          try {
            await sendEmail({
              to: email,
              subject: "MedAxis Verification Code",
              title: "MedAxis Email Verification",
              content: `
                <p>Your verification code is:</p>
                <div class="highlight">${otp}</div>
                <p>Valid for 5 minutes</p>
              `
            });

            res.json({ message: "OTP sent successfully" });

          } catch (mailErr) {
            console.error("Email send failed:", mailErr);
            res.status(500).json({ error: "Failed to send OTP email" });
          }
        });
      }
    );
  } catch (e) {
    console.error("Unexpected OTP error:", e);
    res.status(500).json({ error: "Unexpected server error" });
  }
};

/**
 * POST /api/auth/verify-otp
 */
exports.verifyOtp = (req, res) => {
  const { email, otp } = req.body;

  db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
    if (err) {
      console.error("Verify OTP DB error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(400).json({ error: "Invalid user" });
    }

    const user = results[0];

    if (!user.otp_code || !user.otp_expires_at) {
      return res.status(400).json({ error: "OTP not requested" });
    }

    if (
      user.otp_code !== otp ||
      new Date(user.otp_expires_at) < new Date()
    ) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    db.query(
      "UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE email = ?",
      [email]
    );

    res.json({
      message: "Login successful",
      user: {
        email: user.email,
        firstName: user.first_name
      }
    });
  });
};

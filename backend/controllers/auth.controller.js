const db = require("../config/db");
const generateOTP = require("../utils/otp");
const sendEmail = require("../utils/sendEmail");

const isDevOtpEnabled = process.env.ENABLE_DEV_OTP === "true";

/**
 * POST /api/auth/send-otp
 */
exports.sendOtp = async (req, res) => {
  try {
    const {
      firstName = null,
      lastName = null,
      mobileNumber = null,
      email,
      dateOfBirth = null,
    } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // 1️⃣ Check if user exists
    const [users] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    const isNewUser = users.length === 0;

    if (isNewUser) {
      // 2️⃣ Insert new user
      await db.execute(
        `
        INSERT INTO users
        (first_name, last_name, mobile_number, email, date_of_birth, otp_code, otp_expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [firstName, lastName, mobileNumber, email, dateOfBirth, otp, expiresAt]
      );
    } else {
      // 3️⃣ Update existing user
      await db.execute(
        `
        UPDATE users SET
          first_name = ?,
          last_name = ?,
          mobile_number = ?,
          date_of_birth = ?,
          otp_code = ?,
          otp_expires_at = ?
        WHERE email = ?
        `,
        [firstName, lastName, mobileNumber, dateOfBirth, otp, expiresAt, email]
      );
    }

    // 🔧 DEV MODE
    if (isDevOtpEnabled) {
      console.log("🟡 DEV MODE OTP:", otp);
      return res.json({
        message: "OTP generated (dev mode)",
        devOtp: otp,
      });
    }

    // 🚀 PROD MODE (email sending)
    // await sendEmail({ ... });

    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

/**
 * POST /api/auth/verify-otp
 */
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required" });
  }

  try {
    const [users] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ error: "Invalid user" });
    }

    const user = users[0];

    if (!user.otp_code || !user.otp_expires_at) {
      return res.status(400).json({ error: "OTP not requested" });
    }

    if (
      user.otp_code !== otp ||
      new Date(user.otp_expires_at) < new Date()
    ) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    // Clear OTP
    await db.execute(
      "UPDATE users SET otp_code = NULL, otp_expires_at = NULL WHERE email = ?",
      [email]
    );

    res.json({
      message: "Login successful",
      user: {
        email: user.email,
        firstName: user.first_name,
      },
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};

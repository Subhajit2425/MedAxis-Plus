const db = require("../config/db");
const generateOTP = require("../utils/otp");
const sendEmail = require("../utils/sendEmail");

const isDevOtpEnabled = process.env.ENABLE_DEV_OTP === "true";

/**
 * POST /api/doctor/auth/send-otp
 */
exports.sendDoctorOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // delete old OTPs
    db.query("DELETE FROM doctor_otps WHERE email = ?", [email]);

    // save new OTP
    db.query(
      "INSERT INTO doctor_otps (email, otp, expires_at) VALUES (?, ?, ?)",
      [email, otp, expiresAt],
      async (err) => {
        if (err) {
          console.error("Doctor OTP DB error:", err);
          return res.status(500).json({ error: "Failed to generate OTP" });
        }

        // 🔧 DEV MODE
        if (isDevOtpEnabled) {
          console.log("🟡 DEV MODE DOCTOR OTP:", otp);
          return res.json({
            message: "OTP generated (development mode)",
            devOtp: otp
          });
        }

        // 🚀 PROD MODE
        try {
          await sendEmail({
            to: email,
            subject: "MedAxis Doctor Verification Code",
            title: "MedAxis · Doctor Verification",
            content: `
              <p>Dear Doctor,</p>
              <p>You are attempting to sign in to your <b>MedAxis Doctor Dashboard</b>.</p>
              <div class="highlight">${otp}</div>
              <p>This verification code is valid for <b>5 minutes</b>.</p>
              <p>Regards,<br /><b>MedAxis Support Team</b></p>
            `
          });

          res.json({ message: "OTP sent to doctor email" });

        } catch (mailErr) {
          console.error("Doctor OTP email failed:", mailErr);
          res.status(500).json({ error: "Failed to send OTP email" });
        }
      }
    );
  } catch (err) {
    console.error("Doctor send OTP unexpected error:", err);
    res.status(500).json({ error: "Unexpected server error" });
  }
};

/**
 * POST /api/doctor/auth/verify-otp
 */
exports.verifyDoctorOtp = (req, res) => {
  const { email, otp } = req.body;

  db.query(
    "SELECT * FROM doctor_otps WHERE email = ? AND otp = ?",
    [email, otp],
    (err, otpRows) => {
      if (err || otpRows.length === 0) {
        return res.status(400).json({ error: "Invalid OTP" });
      }

      if (new Date(otpRows[0].expires_at) < new Date()) {
        return res.status(400).json({ error: "OTP expired" });
      }

      // OTP valid → delete it
      db.query("DELETE FROM doctor_otps WHERE email = ?", [email]);

      // check doctor table
      db.query(
        "SELECT * FROM doctors WHERE email = ?",
        [email],
        (err, doctors) => {
          if (doctors.length === 0) {
            return res.json({
              action: "REGISTER",
              message: "Doctor not found, registration required"
            });
          }

          const doctor = doctors[0];

          if (doctor.status === "pending") {
            return res.json({
              action: "PENDING",
              message: "Your account is under verification"
            });
          }

          return res.json({
            action: "LOGIN",
            message: "Login successful",
            doctor: {
              id: doctor.id,
              email: doctor.email
            }
          });
        }
      );
    }
  );
};

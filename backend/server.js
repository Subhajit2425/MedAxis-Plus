require("dotenv").config();
const isDevOtpEnabled = process.env.ALLOW_DEV_OTP;


const crypto = require("crypto");
const sendEmail = require("./utils/sendEmail");
console.log("sendEmail loaded:", typeof sendEmail);

const express = require("express");
const mysql = require("mysql2");
const app = express();

const cors = require("cors");

const allowedOrigins = [
  "http://localhost:5173",
  "https://subhajit2425.github.io",
  "https://subhajit2425.github.io/MedAxis-Plus"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error("CORS not allowed"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));



// Handle preflight requests
app.options("*", cors());

app.use(express.json());



// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  ssl: {
    rejectUnauthorized: false
  },
  connectTimeout: 20000
});


db.connect((err) => {
  if (err) {
    console.log("❌ MySQL Connection Failed", err);
    return;
  }
  console.log("✅ Connected to MySQL!");
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


// API: Get all doctors
app.get("/api/doctors", (req, res) => {
  db.query("SELECT * FROM doctors", (err, results) => {
    if (err) {
      console.error("❌ SQL ERROR:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});


// -----------------------------------------------------
// API: Get single doctor by ID (Doctor Details Page)
// -----------------------------------------------------
app.get("/api/doctors/:id", (req, res) => {
  const doctorId = req.params.id;

  const sql = `
        SELECT id, name, specialization, experience, fees, address, latitude, longitude
        FROM doctors
        WHERE id = ?
    `;

  db.query(sql, [doctorId], (err, results) => {
    if (err) {
      console.error("Error fetching doctor:", err);
      return res.status(500).json({ error: "Failed to fetch doctor details" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.json(results[0]); // return single doctor object
  });
});


// -----------------------------------------------------
// API: Fetch User Details by Email  (Used in Profile.jsx)
// -----------------------------------------------------
app.get("/api/user/:email", (req, res) => {
  const userEmail = req.params.email;

  const sql = `
        SELECT first_name, last_name, mobile_number, email, date_of_birth
        FROM users
        WHERE email = ?
    `;

  db.query(sql, [userEmail], (err, results) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ error: "Failed to fetch user details" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(results[0]); // return the user object
  });
});


// -----------------------------------------------------
// API: Update User Profile
// -----------------------------------------------------
app.put("/api/user/:email", (req, res) => {
  console.log("UPDATE BODY:", req.body); // 👈 ADD THIS

  const userEmail = req.params.email;
  const { firstName, lastName, mobileNumber, dateOfBirth } = req.body;

  const sql = `
        UPDATE users
        SET 
            first_name = ?,
            last_name = ?,
            mobile_number = ?,
            date_of_birth = ?
        WHERE email = ?
    `;

  db.query(
    sql,
    [firstName, lastName, mobileNumber, dateOfBirth, userEmail],
    (err, result) => {
      if (err) {
        console.error("Error updating user:", err);
        return res.status(500).json({ error: "Failed to update profile" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ message: "Profile updated successfully" });
    }
  );
});


// -----------------------------------------------------
// API: Delete User Account
// -----------------------------------------------------
app.delete("/api/user/:email", (req, res) => {
  const userEmail = req.params.email;

  const sql = `DELETE FROM users WHERE email = ?`;

  db.query(sql, [userEmail], (err, result) => {
    if (err) {
      console.error("Error deleting user:", err);
      return res.status(500).json({ error: "Failed to delete user" });
    }

    res.json({ message: "User account deleted successfully" });
  });
});


// -----------------------------------------------------
// NEW API: Book an appointment (Handles POST requests from BookingPage.jsx)
// -----------------------------------------------------
app.post("/api/appointments", (req, res) => {
  // Destructure the data sent from the React form
  const { firstName, lastName, mobileNumber, email, doctorId } = req.body;

  // Define the SQL query to insert data into the 'appointments' table
  const sqlInsert = `
        INSERT INTO appointments (first_name, last_name, mobile_number, email, doctor_id) 
        VALUES (?, ?, ?, ?, ?)
    `;

  // Execute the query using parameterized values (?) to prevent SQL injection
  db.query(sqlInsert, [firstName, lastName, mobileNumber, email, doctorId], (err, result) => {
    if (err) {
      console.error("Error saving appointment:", err);
      return res.status(500).json({ error: "Failed to book appointment" });
    }

    // Send a success response back to the React app
    res.status(201).json({
      message: "Appointment booked successfully",
      appointmentId: result.insertId // Provides the ID of the new booking
    });
  });
});
// -----------------------------------------------------

// 👇 **ADD THIS NEW ROUTE HANDLER** 👇
// -----------------------------------------------------
// NEW API: User Registration/Login (Handles POST requests from LoginPage.jsx)
// This endpoint will store data in the 'users' table
// -----------------------------------------------------


// API: Get all appointments (with doctor names using JOIN)
app.get("/api/appointments", (req, res) => {
  console.log("🔥 BACKEND email param:", req.query.email);
  const userEmail = req.query.email;

  if (!userEmail) {
    return res.status(400).json({ error: "Email is required" });
  }

  const sql = `
    SELECT 
      appointments.*, 
      doctors.name AS doctor_name
    FROM 
      appointments
    JOIN 
      doctors ON appointments.doctor_id = doctors.id
    WHERE 
      appointments.email = ?
    ORDER BY 
      appointments.created_at DESC;
  `;

  db.query(sql, [userEmail], (err, results) => {
    if (err) {
      console.error("Error fetching appointments:", err);
      return res.status(500).json({ error: "Failed to fetch appointments" });
    }
    res.json(results);
  });
});


app.delete("/api/appointments/:id", (req, res) => {
  const appointmentId = req.params.id;
  const userEmail = req.query.email;

  if (!userEmail) {
    return res.status(400).json({ error: "Email is required" });
  }

  const sql = `
    DELETE FROM appointments
    WHERE id = ? AND email = ?
  `;

  db.query(sql, [appointmentId, userEmail], (err, result) => {
    if (err) {
      console.error("Error deleting appointment:", err);
      return res.status(500).json({ error: "Failed to delete appointment" });
    }

    if (result.affectedRows === 0) {
      return res.status(403).json({ error: "Unauthorized or not found" });
    }

    res.json({ message: "Appointment deletced successfully" });
  });
});


app.post("/api/send-otp", async (req, res) => {
  try {
    const { firstName, lastName, mobileNumber, email, dateOfBirth } = req.body;

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

        const query =
          results.length === 0
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

        const values =
          results.length === 0
            ? [firstName, lastName, mobileNumber, email, dateOfBirth, otp, expiresAt]
            : [firstName, lastName, mobileNumber, dateOfBirth, otp, expiresAt, email];

        db.query(query, values, async (err) => {
          if (err) {
            console.error("DB insert/update error:", err);
            return res.status(500).json({ error: "Database write failed" });
          }

          /* ================= DEVELOPMENT MODE ================= */
          if (isDevOtpEnabled) {
            console.log("🟡 DEV MODE OTP:", otp);

            return res.json({
              message: "OTP generated (development mode)",
              devOtp: otp
            });
          }
          /* ==================================================== */

          /* ================= PRODUCTION MODE ================== */
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

            return res.json({ message: "OTP sent successfully" });

          } catch (mailErr) {
            console.error("Email send failed:", mailErr);
            return res.status(500).json({ error: "Failed to send OTP email" });
          }
          /* ==================================================== */
        });
      }
    );
  } catch (e) {
    console.error("Unexpected OTP error:", e);
    return res.status(500).json({ error: "Unexpected server error" });
  }
});




app.post("/api/verify-otp", (req, res) => {
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

    if (user.otp_code !== otp || new Date(user.otp_expires_at) < new Date()) {
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
});



app.post("/api/doctor/send-otp", async (req, res) => {
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

        /* ================= DEVELOPMENT MODE ================= */
        if (isDevOtpEnabled) {
          console.log("🟡 DEV MODE DOCTOR OTP:", otp);

          return res.json({
            message: "OTP generated (development mode)",
            devOtp: otp
          });
        }
        /* ==================================================== */

        /* ================= PRODUCTION MODE ================== */
        try {
          await sendEmail({
            to: email,
            subject: "MedAxis Doctor Verification Code",
            title: "MedAxis · Doctor Verification",
            content: `
              <p>Dear Doctor,</p>

              <p>
                You are attempting to sign in to your
                <b>MedAxis Doctor Dashboard</b>.
              </p>

              <div class="highlight">${otp}</div>

              <p>
                This verification code is valid for <b>5 minutes</b>.
                Please do not share this code with anyone.
              </p>

              <p>
                Regards,<br />
                <b>MedAxis Support Team</b>
              </p>
            `
          });

          return res.json({ message: "OTP sent to doctor email" });

        } catch (mailErr) {
          console.error("Doctor OTP email failed:", mailErr);
          return res.status(500).json({ error: "Failed to send OTP email" });
        }
        /* ==================================================== */
      }
    );
  } catch (err) {
    console.error("Doctor send OTP unexpected error:", err);
    return res.status(500).json({ error: "Unexpected server error" });
  }
});



app.post("/api/doctor/verify-otp", (req, res) => {
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

          // approved doctor
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
});


app.post("/api/doctor/register", (req, res) => {
  const {
    email,
    name,
    specialization,
    experience,
    address,
    fees
  } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // 🔍 Prevent duplicate requests
  db.query(
    "SELECT id FROM doctor_requests WHERE email = ?",
    [email],
    (err, rows) => {
      if (err) return res.status(500).json(err);

      if (rows.length > 0) {
        return res
          .status(400)
          .json({ error: "Doctor request already exists" });
      }

      // ✅ Insert into doctor_requests (NOT doctors)
      db.query(
        `
        INSERT INTO doctor_requests
        (email, name, specialization, experience, address, fees, status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
        `,
        [email, name, specialization, experience, address, fees],
        (err) => {
          if (err) return res.status(500).json(err);

          res.json({
            message: "Registration submitted. Await admin approval."
          });
        }
      );
    }
  );
});


app.get("/api/admin/pending-doctors", (req, res) => {
  db.query(
    `
    SELECT id, name, email, specialization, experience
    FROM doctor_requests
    WHERE status = 'pending'
    `,
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

app.put("/api/admin/approve-doctor/:id", (req, res) => {
  const requestId = req.params.id;

  // 1️⃣ Get request data
  db.query(
    "SELECT * FROM doctor_requests WHERE id = ? AND status = 'pending'",
    [requestId],
    (err, rows) => {
      if (err || rows.length === 0) {
        return res.status(404).json({ error: "Request not found" });
      }

      const doc = rows[0];

      // 2️⃣ Insert into doctors table
      db.query(
        `
        INSERT INTO doctors
        (email, name, specialization, experience, address, fees, status)
        VALUES (?, ?, ?, ?, ?, ?, 'approved')
        `,
        [
          doc.email,
          doc.name,
          doc.specialization,
          doc.experience,
          doc.address,
          doc.fees
        ],
        (err) => {
          if (err) return res.status(500).json(err);

          // 3️⃣ Mark request as approved (DO NOT DELETE)
          db.query(
            "UPDATE doctor_requests SET status = 'approved' WHERE id = ?",
            [requestId]
          );

          res.json({ message: "Doctor approved successfully" });
        }
      );
    }
  );
});

app.put("/api/admin/reject-doctor/:id", (req, res) => {
  db.query(
    "UPDATE doctor_requests SET status = 'rejected' WHERE id = ?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Doctor rejected" });
    }
  );
});


app.get("/api/doctor/status", (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email required" });
  }

  // 1️⃣ Check approved doctors
  db.query(
    "SELECT * FROM doctors WHERE email = ?",
    [email],
    (err, doctors) => {
      if (err) return res.status(500).json(err);

      if (doctors.length > 0) {
        return res.json({
          status: "approved",
          doctor: doctors[0]
        });
      }

      // 2️⃣ Check doctor requests
      db.query(
        "SELECT status FROM doctor_requests WHERE email = ?",
        [email],
        (err, requests) => {
          if (err) return res.status(500).json(err);

          if (requests.length > 0) {
            return res.json({
              status: requests[0].status // pending / rejected
            });
          }

          // 3️⃣ Not found
          res.json({ status: "not_registered" });
        }
      );
    }
  );
});


// -----------------------------------------------------
// API: Get appointments for a specific doctor
// -----------------------------------------------------
app.get("/api/doctor/appointments", (req, res) => {
  const { email, status = "pending" } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Doctor email is required" });
  }

  const sql = `
    SELECT 
      a.id,
      a.first_name,
      a.last_name,
      a.mobile_number,
      a.email AS user_email,
      a.status,
      a.created_at
    FROM appointments a
    JOIN doctors d ON a.doctor_id = d.id
    WHERE d.email = ?
      AND a.status = ?
    ORDER BY a.created_at DESC
  `;

  db.query(sql, [email, status], (err, results) => {
    if (err) {
      console.error("Error fetching doctor appointments:", err);
      return res.status(500).json({ error: "Failed to fetch appointments" });
    }

    res.json(results);
  });
});


// -----------------------------------------------------
// API: Update appointment status (approve / reject)
// -----------------------------------------------------
app.put("/api/doctor/appointments/:id", (req, res) => {
  const appointmentId = req.params.id;
  const { status } = req.body;
  const doctorEmail = req.query.email;

  // Validation
  if (!doctorEmail) {
    return res.status(400).json({ error: "Doctor email is required" });
  }

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  const sql = `
    UPDATE appointments a
    JOIN doctors d ON a.doctor_id = d.id
    SET a.status = ?
    WHERE a.id = ? AND d.email = ?
  `;

  db.query(sql, [status, appointmentId, doctorEmail], (err, result) => {
    if (err) {
      console.error("Error updating appointment status:", err);
      return res.status(500).json({ error: "Failed to update appointment" });
    }

    if (result.affectedRows === 0) {
      return res.status(403).json({
        error: "Unauthorized or appointment not found"
      });
    }

    res.json({
      message: `Appointment ${status} successfully`
    });
  });
});

app.get("/api/doctor/access", (req, res) => {
  const { email } = req.query;

  // 1️⃣ Not logged in
  if (!email) {
    return res.json({
      loggedIn: false
    });
  }

  // 2️⃣ Check doctor_requests table
  const sql = `
    SELECT status
    FROM doctor_requests
    WHERE email = ?
    LIMIT 1
  `;

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Doctor access check error:", err);
      return res.status(500).json({
        error: "Server error"
      });
    }

    // 3️⃣ Logged in but NOT registered as doctor
    if (results.length === 0) {
      return res.json({
        loggedIn: true,
        registered: false
      });
    }

    // 4️⃣ Registered doctor → return status
    const { status } = results[0];

    return res.json({
      loggedIn: true,
      registered: true,
      status // 'pending' | 'approved' | 'rejected'
    });
  });
});


app.get("/api/doctor/profile", (req, res) => {
  const { email } = req.query;

  const sql = `
    SELECT name, specialization, experience
    FROM doctor_requests
    WHERE email = ? AND status = 'approved'
    LIMIT 1
  `;

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.json(results[0]);
  });
});



app.post("/api/feedback", (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  console.log("📩 Feedback received:", req.body);

  const sql = `
    INSERT INTO feedback (name, email, subject, message)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [name, email, subject, message], (err) => {
    if (err) {
      console.error("Feedback save error:", err);
      return res.status(500).json({ error: "Failed to submit feedback" });
    }

    res.json({ message: "Feedback submitted successfully" });
  });
});

app.get("/api/feedback", (req, res) => {
  const sql = `
    SELECT id, name, email, subject, message, created_at
    FROM feedback
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Fetch feedback error:", err);
      return res.status(500).json({ error: "Failed to fetch feedback" });
    }

    res.json(results);
  });
});




app.get("/", (req, res) => {
  res.send("MedAxis+ Backend is running 🚀");
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


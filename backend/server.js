require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors({
  origin: "https://subhajit2425.github.io",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});


db.connect((err) => {
    if (err) {
        console.log("❌ MySQL Connection Failed", err);
        return;
    }
    console.log("✅ Connected to MySQL!");
});

// API: Get all doctors
app.get("/api/doctors", (req, res) => {
    db.query("SELECT * FROM doctors", (err, results) => {
        if (err) return res.status(500).send(err);
        res.send(results);
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
app.post("/api/register-user", (req, res) => {
    // Destructure the data sent from the React form's formData state
    const { firstName, lastName, mobileNumber, email, dateOfBirth } = req.body;

    // Define the SQL query to insert data into the 'users' table (as defined previously)
    const sqlInsertUser = `
        INSERT INTO users (first_name, last_name, mobile_number, email, date_of_birth) 
        VALUES (?, ?, ?, ?, ?)
    `;

    // Execute the query using parameterized values (?) to prevent SQL injection
    db.query(sqlInsertUser, [firstName, lastName, mobileNumber, email, dateOfBirth], (err, result) => {
        if (err) {
            // Handle specific errors like duplicate emails (UNIQUE constraint violation)
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ error: "Email already registered." });
            }
            console.error("Error during user registration:", err);
            return res.status(500).json({ error: "Failed to register user" });
        }
        
        // Send a success response back to the React app
        res.status(201).json({ 
            message: "User registered successfully", 
            userId: result.insertId
        });
    });
});

// -----------------------------------------------------
// 👆 **ADD THIS NEW ROUTE HANDLER** 👆


// API: Get all appointments (with doctor names using JOIN)
app.get("/api/appointments", (req, res) => {
    const sql = `
        SELECT 
            appointments.*, 
            doctors.name AS doctor_name
        FROM 
            appointments
        JOIN 
            doctors ON appointments.doctor_id = doctors.id
        ORDER BY 
            appointments.created_at DESC;
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error fetching appointments:", err);
            return res.status(500).send(err);
        }
        res.json(results);
    });
});

app.delete("/api/appointments/:id", (req, res) => {
    const appointmentId = req.params.id;

    const sqlDelete = `DELETE FROM appointments WHERE id = ?`;

    db.query(sqlDelete, [appointmentId], (err, result) => {
        if (err) {
            console.error("Error deleting appointment:", err);
            return res.status(500).json({ error: "Failed to delete appointment" });
        }

        res.json({ message: "Appointment deleted successfully" });
    });
});

app.get("/", (req, res) => {
  res.send("MedAxis+ Backend is running 🚀");
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


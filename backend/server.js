require("dotenv").config();

const express = require("express");
const app = express();


/* ---------------- CORS CONFIG ---------------- */
const cors = require("cors");

const allowedOrigins = [
  "http://localhost:5173",
  "https://subhajit2425.github.io",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 🔥 VERY IMPORTANT
app.options("*", cors());


/* ---------------- MIDDLEWARE ---------------- */
app.use(express.json());

/* ---------------- ROUTES ---------------- */
app.use("/api/doctor", require("./routes/doctor.routes"));
app.use("/api/doctors", require("./routes/doctor.routes"));
app.use("/api/user", require("./routes/user.routes"));
app.use("/api/appointments", require("./routes/appointment.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/feedback", require("./routes/feedback.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/doctor/auth", require("./routes/doctorAuth.routes"));
app.use("/api/availability", require("./routes/availability.routes"));

/* ---------------- HEALTH CHECK ---------------- */
app.get("/", (req, res) => {
  res.send("MedAxis+ Backend is running 🚀");
});

/* ---------------- SERVER ---------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

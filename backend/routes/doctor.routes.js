const express = require("express");
const router = express.Router();

const doctorController = require("../controllers/doctor.controller");

// ✅ STATIC ROUTES FIRST

// Get all doctors
router.get("/", doctorController.getAllDoctors);

// Doctor registration
router.post("/register", doctorController.registerDoctor);

// Doctor status & access
router.get("/status", doctorController.getDoctorStatus);
router.get("/access", doctorController.checkDoctorAccess);
router.get("/profile", doctorController.getDoctorProfile);

// Doctor appointments
router.get("/appointments", doctorController.getDoctorAppointments);
router.put("/appointments/:id", doctorController.updateAppointmentStatus);

// Doctor schedule
router.get("/appointments/today", doctorController.getTodayAppointments);

// Doctor update appointment status
router.put("/appointments/:id/complete", doctorController.markAppointmentCompleted);

// ✅ DYNAMIC ROUTE LAST
router.get("/:id", doctorController.getDoctorById);

module.exports = router;

const express = require("express");
const router = express.Router();

const doctorController = require("../controllers/doctor.controller");

// GET all doctors
router.get("/", doctorController.getAllDoctors);

// GET single doctor by ID
router.get("/:id", doctorController.getDoctorById);

// Doctor registration
router.post("/register", doctorController.registerDoctor);

// Doctor status & access
router.get("/status", doctorController.getDoctorStatus);
router.get("/access", doctorController.checkDoctorAccess);
router.get("/profile", doctorController.getDoctorProfile);

// Doctor appointments
router.get("/appointments", doctorController.getDoctorAppointments);
router.put("/appointments/:id", doctorController.updateAppointmentStatus);

// Availability & slots
router.post("/availability", doctorController.saveAvailability);
router.get("/:doctorId/slots", doctorController.getAvailableSlots);

module.exports = router;

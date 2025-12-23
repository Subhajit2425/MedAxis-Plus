const express = require("express");
const router = express.Router();

const appointmentController = require("../controllers/appointment.controller");

// Book appointment
router.post("/", appointmentController.bookAppointment);

// Get user appointments
router.get("/", appointmentController.getUserAppointments);

// Cancel appointment (soft delete)
router.put("/:id/cancel", appointmentController.cancelAppointment);

// Get single appointment details
router.get("/:id", appointmentController.getAppointmentById);

module.exports = router;

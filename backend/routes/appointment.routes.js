const express = require("express");
const router = express.Router();

const appointmentController = require("../controllers/appointment.controller");

// Book appointment
router.post("/", appointmentController.bookAppointment);

// Get user appointments
router.get("/", appointmentController.getUserAppointments);

// Delete appointment
router.delete("/:id", appointmentController.deleteAppointment);

module.exports = router;

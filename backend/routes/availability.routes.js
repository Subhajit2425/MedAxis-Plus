const express = require("express");
const router = express.Router();

const availabilityController = require("../controllers/availability.controller");

// POST /api/availability/doctor
router.post("/doctor", availabilityController.saveDoctorAvailability);

// GET /api/availability/doctor/:doctorId
router.get("/doctor/:doctorId", availabilityController.getDoctorAvailability);

// GET /api/availability/doctor/slots
router.get("/doctor/:doctorId/slots", availabilityController.getDoctorSlots);

module.exports = router;


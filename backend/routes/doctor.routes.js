const express = require("express");
const router = express.Router();

const doctorController = require("../controllers/doctor.controller");

// GET all doctors
router.get("/", doctorController.getAllDoctors);

// GET single doctor by ID
router.get("/:id", doctorController.getDoctorById);

module.exports = router;

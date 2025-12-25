const express = require("express");
const router = express.Router();

const symptomsController = require("../controllers/symptoms.controller");

// GET all symptoms
router.get("/", symptomsController.getAllSymptoms);

module.exports = router;

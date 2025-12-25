const express = require("express");
const router = express.Router();

const symptomsController = require("../controllers/symptoms.controller");

// GET all symptoms
router.get("/", symptomsController.getAllSymptoms);

// GET symptoms result
router.post("/result", symptomsController.getSymptomsResult);

module.exports = router;


const express = require("express");
const router = express.Router();

const healthController = require("../controllers/health.controller");

// Check Health
router.get("/", healthController.checkHealth);

module.exports = router;
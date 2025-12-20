const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

// OTP flow
router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);

module.exports = router;

const express = require("express");
const router = express.Router();

const doctorAuthController = require("../controllers/doctorAuth.controller");

// Doctor OTP auth
router.post("/send-otp", doctorAuthController.sendDoctorOtp);
router.post("/verify-otp", doctorAuthController.verifyDoctorOtp);

module.exports = router;

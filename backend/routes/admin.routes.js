const express = require("express");
const router = express.Router();

const adminController = require("../controllers/admin.controller");

// Pending doctors
router.get("/pending-doctors", adminController.getPendingDoctors);

// Approve doctor
router.put("/approve-doctor/:id", adminController.approveDoctor);

// Reject doctor
router.put("/reject-doctor/:id", adminController.rejectDoctor);

module.exports = router;

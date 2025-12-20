const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");

// Fetch user profile
router.get("/:email", userController.getUserByEmail);

// Update user profile
router.put("/:email", userController.updateUserProfile);

// Delete user account
router.delete("/:email", userController.deleteUser);

module.exports = router;

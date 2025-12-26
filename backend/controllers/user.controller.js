const db = require("../config/db");

/**
 * GET /api/user/:email
 * Fetch user profile
 */
exports.getUserByEmail = async (req, res) => {
  const userEmail = req.params.email;

  try {
    const [rows] = await db.execute(
      `
      SELECT first_name, last_name, mobile_number, email, date_of_birth, registration_date
      FROM users
      WHERE email = ?
      `,
      [userEmail]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
};



/**
 * PUT /api/user/:email
 * Update user profile
 */
exports.updateUserProfile = async (req, res) => {
  const userEmail = req.params.email;
  const { firstName, lastName, mobileNumber, dateOfBirth } = req.body;

  try {
    const [result] = await db.execute(
      `
      UPDATE users
      SET
        first_name = ?,
        last_name = ?,
        mobile_number = ?,
        date_of_birth = ?
      WHERE email = ?
      `,
      [firstName, lastName, mobileNumber, dateOfBirth, userEmail]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};



/**
 * DELETE /api/user/:email
 * Delete user account
 */
exports.deleteUser = async (req, res) => {
  const userEmail = req.params.email;

  try {
    await db.execute(
      "DELETE FROM users WHERE email = ?",
      [userEmail]
    );

    res.json({ message: "User account deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
};


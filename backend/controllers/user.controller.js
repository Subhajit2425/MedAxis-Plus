const db = require("../config/db");

/**
 * GET /api/user/:email
 * Fetch user profile
 */
exports.getUserByEmail = (req, res) => {
  const userEmail = req.params.email;

  const sql = `
    SELECT first_name, last_name, mobile_number, email, date_of_birth
    FROM users
    WHERE email = ?
  `;

  db.query(sql, [userEmail], (err, results) => {
    if (err) {
      console.error("Error fetching user:", err);
      return res.status(500).json({ error: "Failed to fetch user details" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(results[0]);
  });
};

/**
 * PUT /api/user/:email
 * Update user profile
 */
exports.updateUserProfile = (req, res) => {
  const userEmail = req.params.email;
  const { firstName, lastName, mobileNumber, dateOfBirth } = req.body;

  const sql = `
    UPDATE users
    SET
      first_name = ?,
      last_name = ?,
      mobile_number = ?,
      date_of_birth = ?
    WHERE email = ?
  `;

  db.query(
    sql,
    [firstName, lastName, mobileNumber, dateOfBirth, userEmail],
    (err, result) => {
      if (err) {
        console.error("Error updating user:", err);
        return res.status(500).json({ error: "Failed to update profile" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ message: "Profile updated successfully" });
    }
  );
};

/**
 * DELETE /api/user/:email
 * Delete user account
 */
exports.deleteUser = (req, res) => {
  const userEmail = req.params.email;

  const sql = `DELETE FROM users WHERE email = ?`;

  db.query(sql, [userEmail], (err) => {
    if (err) {
      console.error("Error deleting user:", err);
      return res.status(500).json({ error: "Failed to delete user" });
    }

    res.json({ message: "User account deleted successfully" });
  });
};

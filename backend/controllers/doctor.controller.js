const db = require("../config/db");

/**
 * GET /api/doctors
 */
exports.getAllDoctors = (req, res) => {
  db.query("SELECT * FROM doctors", (err, results) => {
    if (err) {
      console.error("❌ SQL ERROR:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

/**
 * GET /api/doctors/:id
 */
exports.getDoctorById = (req, res) => {
  const doctorId = req.params.id;

  const sql = `
    SELECT id, name, specialization, experience, fees, address, latitude, longitude
    FROM doctors
    WHERE id = ?
  `;

  db.query(sql, [doctorId], (err, results) => {
    if (err) {
      console.error("Error fetching doctor:", err);
      return res.status(500).json({ error: "Failed to fetch doctor details" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.json(results[0]);
  });
};

const db = require("../config/db");

/**
 * POST /api/appointments
 * Book an appointment
 */
exports.bookAppointment = (req, res) => {
  const { firstName, lastName, mobileNumber, email, doctorId } = req.body;

  const sqlInsert = `
    INSERT INTO appointments
    (first_name, last_name, mobile_number, email, doctor_id)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sqlInsert,
    [firstName, lastName, mobileNumber, email, doctorId],
    (err, result) => {
      if (err) {
        console.error("Error saving appointment:", err);
        return res.status(500).json({ error: "Failed to book appointment" });
      }

      res.status(201).json({
        message: "Appointment booked successfully",
        appointmentId: result.insertId
      });
    }
  );
};

/**
 * GET /api/appointments?email=
 * Fetch appointments for a user
 */
exports.getUserAppointments = (req, res) => {
  const userEmail = req.query.email;

  if (!userEmail) {
    return res.status(400).json({ error: "Email is required" });
  }

  const sql = `
    SELECT
      appointments.*,
      doctors.name AS doctor_name
    FROM appointments
    JOIN doctors ON appointments.doctor_id = doctors.id
    WHERE appointments.email = ?
    ORDER BY appointments.created_at DESC
  `;

  db.query(sql, [userEmail], (err, results) => {
    if (err) {
      console.error("Error fetching appointments:", err);
      return res.status(500).json({ error: "Failed to fetch appointments" });
    }

    res.json(results);
  });
};

/**
 * DELETE /api/appointments/:id
 * Delete appointment
 */
exports.deleteAppointment = (req, res) => {
  const appointmentId = req.params.id;
  const userEmail = req.query.email;

  if (!userEmail) {
    return res.status(400).json({ error: "Email is required" });
  }

  const sql = `
    DELETE FROM appointments
    WHERE id = ? AND email = ?
  `;

  db.query(sql, [appointmentId, userEmail], (err, result) => {
    if (err) {
      console.error("Error deleting appointment:", err);
      return res.status(500).json({ error: "Failed to delete appointment" });
    }

    if (result.affectedRows === 0) {
      return res.status(403).json({ error: "Unauthorized or not found" });
    }

    res.json({ message: "Appointment deleted successfully" });
  });
};

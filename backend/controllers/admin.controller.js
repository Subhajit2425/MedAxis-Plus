const db = require("../config/db");

/**
 * GET /api/admin/pending-doctors
 * Fetch all pending doctor requests
 */
exports.getPendingDoctors = (req, res) => {
  db.query(
    `
    SELECT id, name, email, specialization, experience
    FROM doctor_requests
    WHERE status = 'pending'
    `,
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
};

/**
 * PUT /api/admin/approve-doctor/:id
 * Approve a doctor request
 */
exports.approveDoctor = (req, res) => {
  const requestId = req.params.id;

  db.query(
    "SELECT * FROM doctor_requests WHERE id = ? AND status = 'pending'",
    [requestId],
    (err, rows) => {
      if (err || rows.length === 0) {
        return res.status(404).json({ error: "Request not found" });
      }

      const doc = rows[0];

      db.query(
        `
        INSERT INTO doctors
        (email, name, specialization, experience, address, fees, status)
        VALUES (?, ?, ?, ?, ?, ?, 'approved')
        `,
        [
          doc.email,
          doc.name,
          doc.specialization,
          doc.experience,
          doc.address,
          doc.fees
        ],
        (err) => {
          if (err) return res.status(500).json(err);

          db.query(
            "UPDATE doctor_requests SET status = 'approved' WHERE id = ?",
            [requestId]
          );

          res.json({ message: "Doctor approved successfully" });
        }
      );
    }
  );
};

/**
 * PUT /api/admin/reject-doctor/:id
 * Reject a doctor request
 */
exports.rejectDoctor = (req, res) => {
  db.query(
    "UPDATE doctor_requests SET status = 'rejected' WHERE id = ?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Doctor rejected" });
    }
  );
};

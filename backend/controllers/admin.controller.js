const db = require("../config/db");

/**
 * GET /api/admin/pending-doctors
 */
exports.getPendingDoctors = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `
      SELECT id, name, email, specialization, experience
      FROM doctor_requests
      WHERE status = 'pending'
      `
    );

    res.json(rows);
  } catch (err) {
    console.error("Fetch pending doctors error:", err);
    res.status(500).json({ error: "Failed to fetch pending doctors" });
  }
};

/**
 * PUT /api/admin/approve-doctor/:id
 */
exports.approveDoctor = async (req, res) => {
  const requestId = req.params.id;

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1️⃣ Fetch pending request
    const [rows] = await connection.execute(
      "SELECT * FROM doctor_requests WHERE id = ? AND status = 'pending'",
      [requestId]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Request not found" });
    }

    const doc = rows[0];

    // 2️⃣ Insert into doctors table
    await connection.execute(
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
        doc.fees,
      ]
    );

    // 3️⃣ Update request status
    await connection.execute(
      "UPDATE doctor_requests SET status = 'approved' WHERE id = ?",
      [requestId]
    );

    await connection.commit();

    res.json({ message: "Doctor approved successfully" });
  } catch (err) {
    await connection.rollback();
    console.error("Approve doctor error:", err);
    res.status(500).json({ error: "Failed to approve doctor" });
  } finally {
    connection.release();
  }
};

/**
 * PUT /api/admin/reject-doctor/:id
 */
exports.rejectDoctor = async (req, res) => {
  const requestId = req.params.id;

  try {
    await db.execute(
      "UPDATE doctor_requests SET status = 'rejected' WHERE id = ?",
      [requestId]
    );

    res.json({ message: "Doctor rejected successfully" });
  } catch (err) {
    console.error("Reject doctor error:", err);
    res.status(500).json({ error: "Failed to reject doctor" });
  }
};

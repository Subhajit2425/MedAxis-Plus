const db = require("../config/db");


/**
 * GET /api/doctors
 */
exports.getAllDoctors = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM doctors");
    res.json(rows);
  } catch (err) {
    console.error("SQL ERROR:", err);
    res.status(500).json({ error: "Failed to fetch doctors" });
  }
};


/**
 * GET /api/doctors/:id
 */
exports.getDoctorById = async (req, res) => {
  const doctorId = req.params.id;

  if (isNaN(doctorId)) {
    return res.status(400).json({ error: "Invalid doctor ID" });
  }

  try {
    const [rows] = await db.execute(
      `
      SELECT id, name, specialization, experience, fees, address,
             latitude, longitude, email, created_at
      FROM doctors
      WHERE id = ?
      `,
      [doctorId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching doctor:", err);
    res.status(500).json({ error: "Failed to fetch doctor details" });
  }
};



/**
 * POST /api/doctor/register
 * Doctor registration / re-application
 */
exports.registerDoctor = async (req, res) => {
  const { email, name, specialization, experience, address, fees } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      "SELECT id, status FROM doctor_requests WHERE email = ?",
      [email]
    );

    if (rows.length > 0) {
      const { status } = rows[0];

      if (status === "pending") {
        await connection.rollback();
        return res.status(400).json({
          error: "Your request is already pending approval",
        });
      }

      if (status === "approved") {
        await connection.rollback();
        return res.status(400).json({
          error: "You are already an approved doctor",
        });
      }

      if (status === "rejected") {
        await connection.execute(
          `
          UPDATE doctor_requests
          SET name=?, specialization=?, experience=?, address=?, fees=?, status='pending'
          WHERE email=?
          `,
          [name, specialization, experience, address, fees, email]
        );

        await connection.commit();
        return res.json({
          message: "Reapplication submitted. Await admin approval.",
        });
      }
    }

    await connection.execute(
      `
      INSERT INTO doctor_requests
      (email, name, specialization, experience, address, fees, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
      `,
      [email, name, specialization, experience, address, fees]
    );

    await connection.commit();

    res.json({
      message: "Registration submitted. Await admin approval.",
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ error: "Doctor registration failed" });
  } finally {
    connection.release();
  }
};



/**
 * GET /api/doctor/status
 */
exports.getDoctorStatus = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email required" });
  }

  try {
    const [doctors] = await db.execute(
      "SELECT * FROM doctors WHERE email = ?",
      [email]
    );

    if (doctors.length > 0) {
      return res.json({
        status: "approved",
        doctor: doctors[0],
      });
    }

    const [requests] = await db.execute(
      "SELECT status FROM doctor_requests WHERE email = ?",
      [email]
    );

    if (requests.length > 0) {
      return res.json({ status: requests[0].status });
    }

    res.json({ status: "not_registered" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch doctor status" });
  }
};



/**
 * GET /api/doctor/appointments
 * Fetch appointments for a doctor
 */
exports.getDoctorAppointments = async (req, res) => {
  const { email, status = "pending", date } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Doctor email is required" });
  }

  try {
    let conditions = [];
    let params = [email];

    if (status !== "all") {
      conditions.push("a.status = ?");
      params.push(status);
    }

    if (date) {
      conditions.push("a.appointment_date = ?");
      params.push(date);
    }

    const whereClause =
      conditions.length > 0 ? "AND " + conditions.join(" AND ") : "";

    const [rows] = await db.execute(
      `
      SELECT
        a.id, a.first_name, a.last_name, a.mobile_number,
        a.email AS user_email, a.appointment_date,
        a.start_time, a.end_time, a.status, a.created_at
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      WHERE d.email = ?
      ${whereClause}
      ORDER BY a.appointment_date ASC, a.start_time ASC
      `,
      params
    );

    res.json({
      doctor_email: email,
      count: rows.length,
      appointments: rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
};




/**
 * PUT /api/doctor/appointments/:id
 * Doctor confirms or rejects an appointment
 */
exports.updateAppointmentStatus = async (req, res) => {
  const appointmentId = req.params.id;
  const { status } = req.body;
  const doctorEmail = req.query.email;

  if (!doctorEmail) {
    return res.status(400).json({ error: "Doctor email is required" });
  }

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  try {
    const [result] = await db.execute(
      `
      UPDATE appointments a
      JOIN doctors d ON a.doctor_id = d.id
      SET a.status = ?
      WHERE a.id = ? AND d.email = ? AND a.status = 'pending'
      `,
      [status, appointmentId, doctorEmail]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({
        error: "Unauthorized or appointment not found",
      });
    }

    res.json({ message: "Appointment updated", status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update appointment" });
  }
};



/**
 * GET /api/doctor/access
 */
exports.checkDoctorAccess = async (req, res) => {
  const { email } = req.query;

  if (!email) return res.json({ loggedIn: false });

  try {
    const [rows] = await db.execute(
      `
      SELECT d.id AS doctor_id, r.status
      FROM doctor_requests r
      LEFT JOIN doctors d ON d.email = r.email
      WHERE r.email = ?
      LIMIT 1
      `,
      [email]
    );

    if (rows.length === 0) {
      return res.json({ loggedIn: true, registered: false });
    }

    const { doctor_id, status } = rows[0];

    if (status !== "approved") {
      return res.json({
        loggedIn: true,
        registered: true,
        requestStatus: status,
        canAccessBooking: false,
      });
    }

    const [availability] = await db.execute(
      "SELECT 1 FROM doctor_availability WHERE doctor_id = ? LIMIT 1",
      [doctor_id]
    );

    res.json({
      loggedIn: true,
      registered: true,
      requestStatus: "approved",
      hasAvailability: availability.length > 0,
      canAccessBooking: availability.length > 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Access check failed" });
  }
};



/**
 * GET /api/doctor/profile
 * Fetch approved doctor profile (SOURCE: doctors table)
 */
exports.getDoctorProfile = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const [rows] = await db.execute(
      `
      SELECT name, specialization, experience, fees, address
      FROM doctors
      WHERE email = ?
      LIMIT 1
      `,
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    res.json({ doctor: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch doctor profile" });
  }
};


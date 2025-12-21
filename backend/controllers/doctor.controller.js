const db = require("../config/db");
// const generateSlots = require("../utils/slotGenerator");


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


/**
 * POST /api/doctor/register
 * Doctor registration / re-application
 */
exports.registerDoctor = (req, res) => {
  const {
    email,
    name,
    specialization,
    experience,
    address,
    fees
  } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  db.query(
    "SELECT id, status FROM doctor_requests WHERE email = ?",
    [email],
    (err, rows) => {
      if (err) return res.status(500).json(err);

      // 🟡 Case 1: Record exists
      if (rows.length > 0) {
        const { status } = rows[0];

        // ⛔ Pending → block
        if (status === "pending") {
          return res.status(400).json({
            error: "Your request is already pending approval"
          });
        }

        // ⛔ Approved → block
        if (status === "approved") {
          return res.status(400).json({
            error: "You are already an approved doctor"
          });
        }

        // ✅ Rejected → allow reapply (UPDATE)
        if (status === "rejected") {
          return db.query(
            `
            UPDATE doctor_requests
            SET
              name = ?,
              specialization = ?,
              experience = ?,
              address = ?,
              fees = ?,
              status = 'pending'
            WHERE email = ?
            `,
            [name, specialization, experience, address, fees, email],
            (err) => {
              if (err) return res.status(500).json(err);

              res.json({
                message: "Reapplication submitted. Await admin approval."
              });
            }
          );
        }
      }

      // 🟢 Case 2: No record → INSERT
      db.query(
        `
        INSERT INTO doctor_requests
        (email, name, specialization, experience, address, fees, status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
        `,
        [email, name, specialization, experience, address, fees],
        (err) => {
          if (err) return res.status(500).json(err);

          res.json({
            message: "Registration submitted. Await admin approval."
          });
        }
      );
    }
  );
};


/**
 * GET /api/doctor/status
 */
exports.getDoctorStatus = (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email required" });
  }

  db.query(
    "SELECT * FROM doctors WHERE email = ?",
    [email],
    (err, doctors) => {
      if (err) return res.status(500).json(err);

      if (doctors.length > 0) {
        return res.json({
          status: "approved",
          doctor: doctors[0]
        });
      }

      db.query(
        "SELECT status FROM doctor_requests WHERE email = ?",
        [email],
        (err, requests) => {
          if (err) return res.status(500).json(err);

          if (requests.length > 0) {
            return res.json({ status: requests[0].status });
          }

          res.json({ status: "not_registered" });
        }
      );
    }
  );
};


/**
 * GET /api/doctor/appointments
 * Fetch appointments for a doctor
 */
exports.getDoctorAppointments = (req, res) => {
  const { email, status = "pending", date } = req.query;

  if (!email) {
    return res.status(400).json({
      error: "Doctor email is required",
    });
  }

  // ---- STATUS FILTER ----
  let statusCondition = "";
  const params = [email];

  if (status !== "all") {
    const allowedStatuses = ["pending", "confirmed", "rejected", "cancelled"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    statusCondition = "AND a.status = ?";
    params.push(status);
  }

  // ---- DATE FILTER ----
  let dateCondition = "";
  if (date) {
    dateCondition = "AND a.appointment_date = ?";
    params.push(date);
  }

  const sql = `
    SELECT
      a.id,
      a.first_name,
      a.last_name,
      a.mobile_number,
      a.email           AS user_email,
      a.appointment_date,
      a.start_time,
      a.end_time,
      a.status,
      a.created_at
    FROM appointments a
    JOIN doctors d ON a.doctor_id = d.id
    WHERE d.email = ?
      ${statusCondition}
      ${dateCondition}
    ORDER BY 
      a.appointment_date ASC,
      a.start_time ASC
  `;

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error fetching doctor appointments:", err);
      return res.status(500).json({
        error: "Failed to fetch appointments",
      });
    }

    res.json({
      doctor_email: email,
      count: results.length,
      appointments: results,
    });
  });
};



/**
 * PUT /api/doctor/appointments/:id
 * Doctor confirms or rejects an appointment
 */
exports.updateAppointmentStatus = (req, res) => {
  const appointmentId = req.params.id;
  const { status } = req.body;
  const doctorEmail = req.query.email;

  if (!doctorEmail) {
    return res.status(400).json({
      error: "Doctor email is required",
    });
  }

  // ✅ Status vocabulary synced with booking logic
  if (!["confirmed", "rejected"].includes(status)) {
    return res.status(400).json({
      error: "Invalid status value",
    });
  }

  const sql = `
    UPDATE appointments a
    JOIN doctors d ON a.doctor_id = d.id
    SET a.status = ?
    WHERE a.id = ?
      AND d.email = ?
      AND a.status = 'pending'
  `;

  db.query(sql, [status, appointmentId, doctorEmail], (err, result) => {
    if (err) {
      console.error("Error updating appointment status:", err);
      return res.status(500).json({
        error: "Failed to update appointment",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(403).json({
        error:
          "Unauthorized, appointment not found, or status already updated",
      });
    }

    res.json({
      message:
        status === "confirmed"
          ? "Appointment confirmed successfully"
          : "Appointment rejected successfully",
      status,
    });
  });
};



/**
 * GET /api/doctor/access
 */
exports.checkDoctorAccess = (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.json({ loggedIn: false });
  }

  db.query(
    "SELECT status FROM doctor_requests WHERE email = ? LIMIT 1",
    [email],
    (err, results) => {
      if (err) {
        console.error("Doctor access check error:", err);
        return res.status(500).json({ error: "Server error" });
      }

      if (results.length === 0) {
        return res.json({
          loggedIn: true,
          registered: false
        });
      }

      res.json({
        loggedIn: true,
        registered: true,
        status: results[0].status
      });
    }
  );
};


/**
 * GET /api/doctor/profile
 * Fetch approved doctor profile
 */
exports.getDoctorProfile = (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({
      error: "Email is required",
    });
  }

  const sql = `
    SELECT 
      name,
      specialization,
      experience
    FROM doctor_requests
    WHERE email = ?
      AND status = 'approved'
    LIMIT 1
  `;

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error("Doctor profile fetch error:", err);
      return res.status(500).json({
        error: "Server error",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        error: "Doctor not found or not approved",
      });
    }

    // ✅ STANDARDIZED RESPONSE SHAPE
    res.json({
      doctor: results[0],
    });
  });
};



/**
 * POST /api/doctor/availability
 * Save or update doctor availability
 */
// exports.saveAvailability = (req, res) => {
//   const doctorId = req.user?.id; // auth middleware later
//   const { dayOfWeek, startTime, endTime, slotDuration } = req.body;

//   if (
//     dayOfWeek === undefined ||
//     !startTime ||
//     !endTime ||
//     !slotDuration
//   ) {
//     return res.status(400).json({ error: "Missing fields" });
//   }

//   const sql = `
//     INSERT INTO doctor_availability
//     (doctor_id, day_of_week, start_time, end_time, slot_duration)
//     VALUES (?, ?, ?, ?, ?)
//     ON DUPLICATE KEY UPDATE
//       start_time = VALUES(start_time),
//       end_time = VALUES(end_time),
//       slot_duration = VALUES(slot_duration)
//   `;

//   db.query(
//     sql,
//     [doctorId, dayOfWeek, startTime, endTime, slotDuration],
//     (err) => {
//       if (err) return res.status(500).json(err);
//       res.json({ message: "Availability saved successfully" });
//     }
//   );
// };

/**
 * GET /api/doctor/:doctorId/slots
 * Fetch available slots for a given date
 */
// exports.getAvailableSlots = (req, res) => {
//   const { doctorId } = req.params;
//   const { date } = req.query;

//   if (!date) {
//     return res.status(400).json({ error: "Date is required" });
//   }

//   const dayOfWeek = new Date(date).getDay();

//   db.query(
//     `
//     SELECT * FROM doctor_availability
//     WHERE doctor_id = ? AND day_of_week = ?
//     `,
//     [doctorId, dayOfWeek],
//     (err, availability) => {
//       if (err) return res.status(500).json(err);
//       if (availability.length === 0) return res.json([]);

//       const { start_time, end_time, slot_duration } = availability[0];

//       const allSlots = generateSlots(
//         start_time,
//         end_time,
//         slot_duration
//       );

//       db.query(
//         `
//         SELECT start_time FROM appointments
//         WHERE doctor_id = ?
//         AND appointment_date = ?
//         AND status IN ('pending','confirmed')
//         `,
//         [doctorId, date],
//         (err, booked) => {
//           if (err) return res.status(500).json(err);

//           const bookedTimes = booked.map(b => b.start_time);

//           const availableSlots = allSlots.filter(
//             slot => !bookedTimes.includes(slot.start_time)
//           );

//           res.json(availableSlots);
//         }
//       );
//     }
//   );
// };

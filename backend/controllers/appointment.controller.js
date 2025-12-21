const db = require("../config/db");
const moment = require("moment");

const {
  generateSlots,
  filterPastSlots,
} = require("../utils/slotGenerator");


/**
 * POST /api/appointments
 * Book an appointment
 */
// exports.bookAppointment = (req, res) => {
//   const {
//     firstName,
//     lastName,
//     mobileNumber,
//     email,
//     doctorId
//   } = req.body;

//   console.log("BOOK APPOINTMENT BODY:", req.body);

//   if (!firstName || !lastName || !mobileNumber || !email || !doctorId) {
//     return res.status(400).json({
//       error: "Missing required fields"
//     });
//   }

//   const appointmentDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
//   const SLOT_DURATION = 15; // minutes

//   // 🔹 Find last appointment of today for this doctor
//   const lastSlotSql = `
//     SELECT end_time
//     FROM appointments
//     WHERE doctor_id = ?
//       AND appointment_date = ?
//     ORDER BY end_time DESC
//     LIMIT 1
//   `;

//   db.query(
//     lastSlotSql,
//     [doctorId, appointmentDate],
//     (err, rows) => {
//       if (err) {
//         console.error("Slot fetch error:", err);
//         return res.status(500).json({ error: "Failed to allocate slot" });
//       }

//       let startTime;

//       if (rows.length === 0) {
//         // 🟢 First slot of the day
//         startTime = "09:00:00";
//       } else {
//         startTime = rows[0].end_time;
//       }

//       // 🔹 Calculate end time
//       const [h, m, s] = startTime.split(":").map(Number);
//       const start = new Date();
//       start.setHours(h, m, s || 0, 0);

//       const end = new Date(start.getTime() + SLOT_DURATION * 60000);
//       const endTime = end.toTimeString().slice(0, 8);

//       // 🔹 Insert appointment
//       const insertSql = `
//         INSERT INTO appointments
//         (
//           first_name,
//           last_name,
//           mobile_number,
//           email,
//           doctor_id,
//           appointment_date,
//           start_time,
//           end_time,
//           status
//         )
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
//       `;

//       db.query(
//         insertSql,
//         [
//           firstName,
//           lastName,
//           mobileNumber,
//           email,
//           doctorId,
//           appointmentDate,
//           startTime,
//           endTime
//         ],
//         (err, result) => {
//           if (err) {
//             console.error("Error saving appointment:", err);
//             return res.status(500).json({
//               error: "Failed to book appointment"
//             });
//           }

//           res.status(201).json({
//             message: "Appointment booked successfully",
//             appointmentId: result.insertId,
//             appointmentDate,
//             startTime,
//             endTime
//           });
//         }
//       );
//     }
//   );
// };


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



// POST /api/appointments
exports.bookAppointment = async (req, res) => {
  const {
    doctor_id,
    appointment_date,
    start_time,
    end_time,
    first_name,
    last_name,
    email,
    mobile_number,
  } = req.body;

  // ---------- BASIC VALIDATION ----------
  if (
    !doctor_id ||
    !appointment_date ||
    !start_time ||
    !end_time ||
    !first_name ||
    !email ||
    !mobile_number
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!moment(appointment_date, "YYYY-MM-DD", true).isValid()) {
    return res.status(400).json({ error: "Invalid date format" });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1️⃣ Get day_of_week
    const dayOfWeek = moment(appointment_date).isoWeekday();

    // 2️⃣ Fetch doctor availability
    const [availabilityRows] = await connection.execute(
      `
      SELECT start_time, end_time, break_start, break_end, slot_duration
      FROM doctor_availability
      WHERE doctor_id = ? AND day_of_week = ?
      `,
      [doctor_id, dayOfWeek]
    );

    if (availabilityRows.length === 0) {
      throw new Error("Doctor is unavailable on selected date");
    }

    const availability = availabilityRows[0];

    // 3️⃣ Generate slots again (server truth)
    let slots = generateSlots({
      date: appointment_date,
      start_time: availability.start_time,
      end_time: availability.end_time,
      break_start: availability.break_start,
      break_end: availability.break_end,
      slot_duration: availability.slot_duration,
    });

    slots = filterPastSlots(slots, appointment_date);

    // 4️⃣ Check requested slot exists
    const requestedSlot = slots.find(
      (s) => s.start_time === start_time && s.end_time === end_time
    );

    if (!requestedSlot) {
      throw new Error("Invalid or expired slot");
    }

    // 5️⃣ Lock & check existing bookings (CRITICAL)
    const [existingRows] = await connection.execute(
      `
      SELECT id
      FROM appointments
      WHERE doctor_id = ?
        AND appointment_date = ?
        AND start_time = ?
        AND status != 'cancelled'
      FOR UPDATE
      `,
      [doctor_id, appointment_date, start_time]
    );

    if (existingRows.length > 0) {
      throw new Error("Slot already booked");
    }

    // 6️⃣ Insert appointment
    await connection.execute(
      `
      INSERT INTO appointments
      (doctor_id, appointment_date, start_time, end_time,
       first_name, last_name, email, mobile_number, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `,
      [
        doctor_id,
        appointment_date,
        start_time,
        end_time,
        first_name,
        last_name || null,
        email,
        mobile_number,
      ]
    );

    await connection.commit();

    res.status(201).json({
      message: "Appointment booked successfully",
      status: "pending",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Booking error:", error.message);

    res.status(400).json({
      error: error.message || "Failed to book appointment",
    });
  } finally {
    connection.release();
  }
};

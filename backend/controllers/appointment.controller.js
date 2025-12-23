const db = require("../config/db");
const moment = require("moment");

const {
  generateSlots,
  filterPastSlots,
} = require("../utils/slotGenerator");


/**
 * GET /api/appointments?email=
 * Fetch appointments for a user
 */
exports.getUserAppointments = async (req, res) => {
  const userEmail = req.query.email;

  if (!userEmail) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const [rows] = await db.execute(
      `
      SELECT
        a.id,
        a.doctor_id,
        a.email,
        a.status,
        a.appointment_date,
        a.created_at,
        d.name AS doctor_name
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      WHERE a.email = ?
      ORDER BY a.appointment_date DESC
      `,
      [userEmail]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching appointments:", err);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
};



/**
 * PUT /api/appointments/:id/cancel
 * Cancel appointment (soft delete)
 */
exports.cancelAppointment = async (req, res) => {
  const appointmentId = req.params.id;
  const userEmail = req.query.email;

  if (!userEmail) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const [result] = await db.execute(
      `
      UPDATE appointments
      SET status = 'cancelled'
      WHERE id = ? AND email = ?
      `,
      [appointmentId, userEmail]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ error: "Unauthorized or appointment not found" });
    }

    res.json({ message: "Appointment cancelled successfully" });
  } catch (err) {
    console.error("Error cancelling appointment:", err);
    res.status(500).json({ error: "Failed to cancel appointment" });
  }
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

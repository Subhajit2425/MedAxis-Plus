const db = require("../config/db");
const moment = require("moment");

const {
  generateSlots,
  filterPastSlots,
} = require("../utils/slotGenerator");


// POST /api/availability/doctor
exports.saveDoctorAvailability = async (req, res) => {
  const {
    email,
    start_time,
    end_time,
    slot_duration,
    break_start,
    break_end,
  } = req.body;

  // ---------- BASIC VALIDATION ----------
  if (!email || !start_time || !end_time || !slot_duration) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  if (start_time >= end_time) {
    return res.status(400).json({
      error: "Start time must be before end time",
    });
  }

  if (
    (break_start && !break_end) ||
    (!break_start && break_end)
  ) {
    return res.status(400).json({
      error: "Both break start and break end are required",
    });
  }

  if (
    break_start &&
    break_end &&
    (break_start >= break_end ||
      break_start < start_time ||
      break_end > end_time)
  ) {
    return res.status(400).json({
      error: "Invalid break time",
    });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 🔹 Fetch doctor_id from doctors table
    const [doctors] = await connection.execute(
      "SELECT id FROM doctors WHERE email = ? LIMIT 1",
      [email]
    );

    if (doctors.length === 0) {
      throw new Error("Doctor not found");
    }

    const doctor_id = doctors[0].id;

    // 🔹 Save same availability for all 7 days
    for (let day = 1; day <= 7; day++) {
      await connection.execute(
        `
        INSERT INTO doctor_availability
        (doctor_id, day_of_week, start_time, end_time, break_start, break_end, slot_duration)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          start_time = VALUES(start_time),
          end_time = VALUES(end_time),
          break_start = VALUES(break_start),
          break_end = VALUES(break_end),
          slot_duration = VALUES(slot_duration)
        `,
        [
          doctor_id,
          day,
          start_time,
          end_time,
          break_start || null,
          break_end || null,
          slot_duration,
        ]
      );
    }

    await connection.commit();

    res.json({
      message: "Doctor availability saved successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Save availability error:", error);

    res.status(400).json({
      error: error.message || "Failed to save availability",
    });
  } finally {
    connection.release();
  }
};



// GET /api/availability/doctor/:doctorId
exports.getDoctorAvailability = async (req, res) => {
  const { doctorId } = req.params;

  if (!doctorId) {
    return res.status(400).json({ error: "Doctor ID is required" });
  }

  try {
    const query = `
      SELECT
        day_of_week,
        start_time,
        end_time,
        break_start,
        break_end,
        slot_duration
      FROM doctor_availability
      WHERE doctor_id = ?
      ORDER BY day_of_week
    `;

    const [rows] = await db.execute(query, [doctorId]);

    res.json({
      doctor_id: doctorId,
      availability: rows,
    });
  } catch (error) {
    console.error("Fetch availability error:", error);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
};


// GET /api/availability/doctor/:doctorId/slots?date=YYYY-MM-DD
exports.getDoctorSlots = async (req, res) => {
  const { doctorId } = req.params;
  const { date } = req.query;

  // -------- VALIDATION --------
  if (!doctorId || !date) {
    return res.status(400).json({ error: "Doctor ID and date are required" });
  }

  if (!moment(date, "YYYY-MM-DD", true).isValid()) {
    return res.status(400).json({ error: "Invalid date format" });
  }

  try {
    // 1️⃣ Convert date → day_of_week (1–7)
    const dayOfWeek = moment(date).isoWeekday(); // 1 = Monday

    // 2️⃣ Fetch availability for that doctor & day
    const [availabilityRows] = await db.execute(
      `
      SELECT start_time, end_time, break_start, break_end, slot_duration
      FROM doctor_availability
      WHERE doctor_id = ? AND day_of_week = ?
      `,
      [doctorId, dayOfWeek]
    );

    // ❌ Doctor unavailable that day
    if (availabilityRows.length === 0) {
      return res.json({
        doctor_id: doctorId,
        date,
        slots: [],
      });
    }

    const availability = availabilityRows[0];

    // 3️⃣ Generate slots
    let slots = generateSlots({
      date,
      start_time: availability.start_time,
      end_time: availability.end_time,
      break_start: availability.break_start,
      break_end: availability.break_end,
      slot_duration: availability.slot_duration,
    });

    // 4️⃣ Remove past slots (if today)
    slots = filterPastSlots(slots, date);

    // 5️⃣ Fetch booked appointments
    const [bookedRows] = await db.execute(
      `
      SELECT start_time
      FROM appointments
      WHERE doctor_id = ?
        AND appointment_date = ?
        AND status IN ('pending', 'confirmed')
      `,
      [doctorId, date]
    );


    const bookedSet = new Set(
      bookedRows.map((row) => row.start_time.slice(0, 5))
    );

    // 6️⃣ Mark booked slots unavailable
    const finalSlots = slots.map((slot) => ({
      ...slot,
      available: !bookedSet.has(slot.start_time),
    }));

    res.json({
      doctor_id: doctorId,
      date,
      slots: finalSlots,
    });
  } catch (error) {
    console.error("Get slots error:", error);
    res.status(500).json({ error: "Failed to fetch slots" });
  }
};



/**
 * GET /api/availability/doctor/:doctorId/next-slot
 * Returns the earliest upcoming available slot (today or future)
 */
exports.getNextAvailableSlot = async (req, res) => {
  const { doctorId } = req.params;

  try {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // We search up to next 30 days (professional safety limit)
    const MAX_DAYS_LOOKAHEAD = 30;

    for (let i = 0; i < MAX_DAYS_LOOKAHEAD; i++) {
      const checkDate = new Date();
      checkDate.setDate(today.getDate() + i);
      const dateStr = checkDate.toISOString().split("T")[0];

      // Fetch available slots for this date
      const [slots] = await db.execute(
        `
        SELECT
          s.start_time,
          s.end_time
        FROM doctor_slots s
        WHERE s.doctor_id = ?
          AND s.slot_date = ?
          AND s.available = 1
        ORDER BY s.start_time ASC
        `,
        [doctorId, dateStr]
      );

      if (!slots.length) continue;

      // If today → skip past-time slots
      const validSlot = slots.find((slot) => {
        if (dateStr !== todayStr) return true;

        const [h, m] = slot.start_time.split(":").map(Number);
        const slotTime = new Date();
        slotTime.setHours(h, m, 0, 0);

        return slotTime > today;
      });

      if (validSlot) {
        return res.json({
          success: true,
          date: dateStr,
          slot: validSlot,
        });
      }
    }

    // No slot found in range
    return res.status(404).json({
      success: false,
      message: "No upcoming slots available",
    });

  } catch (error) {
    console.error("Next available slot error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to find next available slot",
    });
  }
};

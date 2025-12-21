const db = require("../config/db");
const moment = require("moment");

const {
  generateSlots,
  filterPastSlots,
} = require("../utils/slotGenerator");


// POST /api/doctor/availability
exports.saveDoctorAvailability = async (req, res) => {
  const { doctor_id, availability } = req.body;

  if (!doctor_id || !Array.isArray(availability)) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    for (const day of availability) {
      const {
        day_of_week,
        start_time,
        end_time,
        break_start,
        break_end,
        slot_duration,
      } = day;

      // ---------- VALIDATIONS ----------
      if (
        !day_of_week ||
        day_of_week < 1 ||
        day_of_week > 7 ||
        !start_time ||
        !end_time ||
        slot_duration <= 0
      ) {
        throw new Error("Invalid availability data");
      }

      if (start_time >= end_time) {
        throw new Error("Start time must be before end time");
      }

      if (
        (break_start && !break_end) ||
        (!break_start && break_end)
      ) {
        throw new Error("Both break start and end are required");
      }

      if (break_start && break_end) {
        if (
          break_start >= break_end ||
          break_start < start_time ||
          break_end > end_time
        ) {
          throw new Error("Invalid break time");
        }
      }

      // ---------- UPSERT QUERY ----------
      const query = `
        INSERT INTO doctor_availability
        (doctor_id, day_of_week, start_time, end_time, break_start, break_end, slot_duration)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          start_time = VALUES(start_time),
          end_time = VALUES(end_time),
          break_start = VALUES(break_start),
          break_end = VALUES(break_end),
          slot_duration = VALUES(slot_duration)
      `;

      await connection.execute(query, [
        doctor_id,
        day_of_week,
        start_time,
        end_time,
        break_start || null,
        break_end || null,
        slot_duration,
      ]);
    }

    await connection.commit();

    res.json({ message: "Doctor availability saved successfully" });
  } catch (error) {
    await connection.rollback();
    console.error(error);

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
        AND status != 'cancelled'
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

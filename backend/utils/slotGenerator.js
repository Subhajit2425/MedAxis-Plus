const moment = require("moment");

/**
 * Generate slots for a given date & availability
 */
function generateSlots({
  date,            // YYYY-MM-DD
  start_time,      // "10:00:00"
  end_time,        // "17:00:00"
  break_start,     // "13:00:00" | null
  break_end,       // "14:00:00" | null
  slot_duration,   // minutes
}) {
  const slots = [];

  let current = moment(`${date} ${start_time}`, "YYYY-MM-DD HH:mm:ss");
  const end = moment(`${date} ${end_time}`, "YYYY-MM-DD HH:mm:ss");

  const breakStart = break_start
    ? moment(`${date} ${break_start}`, "YYYY-MM-DD HH:mm:ss")
    : null;

  const breakEnd = break_end
    ? moment(`${date} ${break_end}`, "YYYY-MM-DD HH:mm:ss")
    : null;

  while (current.clone().add(slot_duration, "minutes").isSameOrBefore(end)) {
    const slotStart = current.clone();
    const slotEnd = current.clone().add(slot_duration, "minutes");

    // Skip break time
    if (
      breakStart &&
      breakEnd &&
      slotStart.isBefore(breakEnd) &&
      slotEnd.isAfter(breakStart)
    ) {
      current = breakEnd.clone();
      continue;
    }

    slots.push({
      start_time: slotStart.format("HH:mm"),
      end_time: slotEnd.format("HH:mm"),
      available: true,
    });

    current = slotEnd;
  }

  return slots;
}

module.exports = generateSlots;


/**
 * Remove Past-Time Slots
 */
function filterPastSlots(slots, date) {
  const now = moment();

  // If date is not today → no filtering
  if (!moment(date).isSame(now, "day")) {
    return slots;
  }

  return slots.filter((slot) => {
    const slotTime = moment(
      `${date} ${slot.start_time}`,
      "YYYY-MM-DD HH:mm"
    );
    return slotTime.isAfter(now);
  });
}

module.exports = {
  generateSlots,
  filterPastSlots,
};

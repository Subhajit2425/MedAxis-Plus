function generateSlots(startTime, endTime, duration) {
  const slots = [];
  let current = new Date(`1970-01-01T${startTime}`);
  const end = new Date(`1970-01-01T${endTime}`);

  while (current < end) {
    const next = new Date(current.getTime() + duration * 60000);

    if (next > end) break;

    slots.push({
      start_time: current.toTimeString().slice(0, 5),
      end_time: next.toTimeString().slice(0, 5)
    });

    current = next;
  }

  return slots;
}

module.exports = generateSlots;

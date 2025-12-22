const db = require("../config/db");

/**
 * POST /api/feedback
 * Save user feedback
 */
exports.submitFeedback = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  console.log("📩 Feedback received:", req.body);

  try {
    await db.execute(
      `
      INSERT INTO feedback (name, email, subject, message)
      VALUES (?, ?, ?, ?)
      `,
      [name, email, subject, message]
    );

    res.json({ message: "Feedback submitted successfully" });
  } catch (err) {
    console.error("Feedback save error:", err);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
};


/**
 * GET /api/feedback
 * Fetch all feedback (admin use)
 */
exports.getAllFeedback = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `
      SELECT id, name, email, subject, message, created_at
      FROM feedback
      ORDER BY created_at DESC
      `
    );

    res.json(rows);
  } catch (err) {
    console.error("Fetch feedback error:", err);
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
};


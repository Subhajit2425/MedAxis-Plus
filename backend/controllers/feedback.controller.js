const db = require("../config/db");

/**
 * POST /api/feedback
 * Save user feedback
 */
exports.submitFeedback = (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  console.log("📩 Feedback received:", req.body);

  const sql = `
    INSERT INTO feedback (name, email, subject, message)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [name, email, subject, message], (err) => {
    if (err) {
      console.error("Feedback save error:", err);
      return res.status(500).json({ error: "Failed to submit feedback" });
    }

    res.json({ message: "Feedback submitted successfully" });
  });
};

/**
 * GET /api/feedback
 * Fetch all feedback (admin use)
 */
exports.getAllFeedback = (req, res) => {
  const sql = `
    SELECT id, name, email, subject, message, created_at
    FROM feedback
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Fetch feedback error:", err);
      return res.status(500).json({ error: "Failed to fetch feedback" });
    }

    res.json(results);
  });
};

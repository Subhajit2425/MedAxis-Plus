const db = require("../config/db"); // adjust path if needed

/**
 * GET /api/symptoms
 * Fetch all active symptoms
 */
exports.getAllSymptoms = (req, res) => {
  const sql = `
    SELECT 
      id,
      symptom_key,
      label,
      category,
      is_emergency
    FROM symptoms
    WHERE is_active = TRUE
    ORDER BY label ASC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching symptoms:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch symptoms"
      });
    }

    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  });
};

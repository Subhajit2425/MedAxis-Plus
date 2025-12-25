const db = require("../config/db");

/**
 * GET /api/symptoms
 * Fetch all active symptoms
 */
exports.getAllSymptoms = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        id,
        symptom_key,
        label,
        category,
        is_emergency
      FROM symptoms
      WHERE is_active = TRUE
      ORDER BY label ASC
    `);

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });

  } catch (error) {
    console.error("Error fetching symptoms:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch symptoms"
    });
  }
};

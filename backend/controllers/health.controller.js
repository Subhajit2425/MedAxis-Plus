const db = require("../config/db");

/**
 * GET /api/health
 */
exports.checkHealth = async (req, res) => {
  try {
    // Lightweight DB ping
    await db.query("SELECT 1");

    res.json({
      status: "ok",
      db: "connected"
    });
  } catch (err) {
    console.error("Health check failed:", err);

    res.status(500).json({
      status: "error",
      db: "disconnected"
    });
  }
};

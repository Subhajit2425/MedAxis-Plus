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

/**
 * GET /api/symptoms/result
 * Fetch the result for the selected symptoms
 */
exports.getSymptomsResult = async (req, res) => {
  try {
    const { symptoms } = req.body;

    /* =====================
       1. Validation
    ====================== */
    if (!Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Symptoms array is required"
      });
    }

    /* =====================
       2. Emergency detection
       (from symptoms table)
    ====================== */
    const [emergencyRows] = await db.query(
      `
      SELECT symptom_key
      FROM symptoms
      WHERE is_emergency = TRUE
      AND symptom_key IN (?)
      `,
      [symptoms]
    );

    const emergency = emergencyRows.length > 0;

    /* =====================
       3. Fetch active conditions
    ====================== */
    const [conditions] = await db.query(
      `
      SELECT 
        id,
        condition_name,
        specialist,
        default_urgency
      FROM conditions
      WHERE is_active = TRUE
      `
    );

    /* =====================
       4. Fetch condition-symptom mappings
    ====================== */
    const [mappings] = await db.query(
      `
      SELECT condition_id, symptom_key
      FROM condition_symptoms
      `
    );

    /* =====================
       5. Build condition → symptoms map
    ====================== */
    const conditionMap = {};
    mappings.forEach(row => {
      if (!conditionMap[row.condition_id]) {
        conditionMap[row.condition_id] = [];
      }
      conditionMap[row.condition_id].push(row.symptom_key);
    });

    /* =====================
       6. Score conditions
    ====================== */
    const scoredConditions = conditions
      .map(cond => {
        const condSymptoms = conditionMap[cond.id] || [];
        if (condSymptoms.length === 0) return null;

        const matched = condSymptoms.filter(s =>
          symptoms.includes(s)
        );

        const score = matched.length / condSymptoms.length;

        return score > 0
          ? {
              condition: cond.condition_name,
              specialist: cond.specialist,
              urgency: cond.default_urgency,
              score
            }
          : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score);

    /* =====================
       7. Decide final output
    ====================== */
    const topConditions = scoredConditions.slice(0, 3);

    res.status(200).json({
      possibleConditions: topConditions.map(c => c.condition),
      specialist: topConditions[0]?.specialist || "General Physician",
      urgency: emergency
        ? "High"
        : topConditions[0]?.urgency || "Low",
      emergency,
      selectedSymptoms: symptoms
    });

  } catch (error) {
    console.error("Symptoms result error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to analyze symptoms"
    });
  }
};

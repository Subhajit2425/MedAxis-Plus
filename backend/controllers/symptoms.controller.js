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
 * POST /api/symptoms/result
 * Analyze selected symptoms and return AI-assisted result
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
       2. Emergency detection (DB-driven)
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
      SELECT id, condition_name, specialist, default_urgency
      FROM conditions
      WHERE is_active = TRUE
      `
    );

    /* =====================
       4. Fetch condition-symptom mappings WITH WEIGHTS
    ====================== */
    const [mappings] = await db.query(
      `
      SELECT condition_id, symptom_key, weight
      FROM condition_symptoms
      `
    );

    /* =====================
       5. Build condition → symptoms map (WITH weight)
    ====================== */
    const conditionMap = {};
    mappings.forEach(row => {
      if (!conditionMap[row.condition_id]) {
        conditionMap[row.condition_id] = [];
      }
      conditionMap[row.condition_id].push({
        symptom_key: row.symptom_key,
        weight: row.weight
      });
    });

    /* =====================
       6. Score conditions (WEIGHTED)
    ====================== */
    const scoredConditions = conditions
      .map(cond => {
        const condSymptoms = conditionMap[cond.id] || [];
        if (!condSymptoms.length) return null;

        let matchedWeight = 0;
        let totalWeight = 0;
        let hasCriticalSymptom = false;

        condSymptoms.forEach(cs => {
          totalWeight += cs.weight;

          if (symptoms.includes(cs.symptom_key)) {
            matchedWeight += cs.weight;

            if (cs.weight >= 3) {
              hasCriticalSymptom = true;
            }
          }
        });

        if (matchedWeight === 0) return null;

        const severityRatio = matchedWeight / totalWeight;

        return {
          condition: cond.condition_name,
          specialist: cond.specialist,
          defaultUrgency: cond.default_urgency,
          severityRatio,
          hasCriticalSymptom
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.severityRatio - a.severityRatio);

    /* =====================
       7. Determine urgency (FINAL LOGIC)
    ====================== */
    let urgency = "Low";

    if (emergency) {
      urgency = "High";
    } else if (scoredConditions.length) {
      const best = scoredConditions[0];

      if (best.severityRatio >= 0.7) {
        urgency = "High";
      } else if (best.severityRatio >= 0.4) {
        urgency = "Medium";
      } else {
        urgency = best.defaultUrgency || "Low";
      }
    }

    /* =====================
       8. Final response
    ====================== */
    const topConditions = scoredConditions.slice(0, 3);

    res.status(200).json({
      possibleConditions: topConditions.map(c => c.condition),
      specialist: topConditions[0]?.specialist || "General Physician",
      urgency,
      emergency: urgency === "High",
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

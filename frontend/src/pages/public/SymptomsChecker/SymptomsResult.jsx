import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../../api/api";

import {
  Container,
  Typography,
  Box,
  Chip,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  Button
} from "@mui/material";

import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

export default function SymptomsResult() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const selectedSymptoms = state?.symptoms || [];

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedSymptoms.length) {
      navigate("/symptoms", { replace: true });
      return;
    }

    api
      .post("/api/symptoms/result", {
        symptoms: selectedSymptoms
      })
      .then((res) => {
        setResult(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to analyze symptoms at the moment.");
        setLoading(false);
      });
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Health Insight Result
      </Typography>

      <Typography color="text.secondary" mb={4}>
        Based on the symptoms you selected, here is an AI-assisted health insight.
      </Typography>

      {loading && (
        <Box textAlign="center" py={6}>
          <CircularProgress />
          <Typography mt={2} color="text.secondary">
            Analyzing symptoms…
          </Typography>
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && result && (
        <>
          {/* 🚨 Emergency Alert */}
          {result.emergency && (
            <Alert
              severity="error"
              icon={<WarningAmberIcon />}
              sx={{ mb: 4, fontSize: 16 }}
            >
              This may be a medical emergency. Please seek immediate medical
              attention.
            </Alert>
          )}

          {/* Selected Symptoms */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography fontWeight={600} mb={2}>
              Symptoms you selected
            </Typography>

            <Box display="flex" gap={1} flexWrap="wrap">
              {result.selectedSymptoms.map((symptom) => (
                <Chip key={symptom} label={symptom.replace(/_/g, " ")} />
              ))}
            </Box>
          </Paper>

          {/* Possible Conditions */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography fontWeight={600} mb={1}>
              Possible health concerns
            </Typography>

            <Typography color="text.secondary" mb={2}>
              These are not diagnoses but possible indications based on symptoms.
            </Typography>

            <Box component="ul" sx={{ pl: 3, m: 0 }}>
              {result.possibleConditions.slice(0, 3).map((cond, index) => (
                <li key={index}>
                  <Typography>{cond}</Typography>
                </li>
              ))}
            </Box>
          </Paper>

          {/* Specialist Recommendation */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <LocalHospitalIcon color="primary" />
              <Typography fontWeight={600}>
                Recommended Specialist
              </Typography>
            </Box>

            <Typography fontSize={18}>
              {result.specialist}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography color="text.secondary">
              Urgency level: <strong>{result.urgency}</strong>
            </Typography>
          </Paper>

          {/* Disclaimer */}
          <Alert severity="info" sx={{ mb: 4 }}>
            This AI result is for informational purposes only and should not be
            considered a medical diagnosis. Please consult a qualified doctor.
          </Alert>

          {/* CTA */}
          <Box textAlign="right">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/doctors")}
              sx={{ px: 5, py: 1.5 }}
            >
              Book a Doctor
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
}

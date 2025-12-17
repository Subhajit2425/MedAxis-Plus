import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert
} from "@mui/material";
import api from "../../../api/api";

export default function DoctorRegister() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    specialization: "",
    experience: "",
    address: "",
    fees: ""
  });

  // 🔐 Safety: block direct access
  useEffect(() => {
    if (!state?.email) {
      navigate("/doctor/login", { replace: true });
    }
  }, [state, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setError("");
    setSubmitting(true);

    try {
      await api.post("/api/doctor/register", {
        email: state.email,
        ...form
      });

      alert("Registration submitted. Your account is under verification.");
      navigate("/doctor/status", { replace: true });
    } catch (err) {
      setError("Failed to submit registration. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h5" gutterBottom>
          Doctor Registration
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Complete your profile. Our team will verify your details before approval.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {Object.keys(form).map((field) => (
          <TextField
            key={field}
            fullWidth
            margin="normal"
            name={field}
            label={field.toUpperCase()}
            value={form[field]}
            onChange={handleChange}
          />
        ))}

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          disabled={submitting}
          onClick={submit}
        >
          {submitting ? "Submitting..." : "Submit for Verification"}
        </Button>
      </Box>
    </Container>
  );
}

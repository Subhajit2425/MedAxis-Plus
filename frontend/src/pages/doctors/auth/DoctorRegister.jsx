import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Box,
  Alert,
  Snackbar,
} from "@mui/material";
import api from "../../../api/api";

export default function DoctorRegister() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    specialization: "",
    experience: "",
    address: "",
    fees: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  // 🔐 Block direct access
  useEffect(() => {
    if (!state?.email) {
      navigate("/doctor/login", { replace: true });
    }
  }, [state, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setSubmitting(true);

    try {
      await api.post("/api/doctor/register", {
        email: state.email,

        // doctor profile
        name: form.name,
        specialization: form.specialization,
        experience: form.experience,
        address: form.address,
        fees: form.fees,

        // 🔹 availability (used by slot generator)
        availability: {
          start_time: form.start_time,
          end_time: form.end_time,
          slot_duration: Number(form.slot_duration),
          break_start: form.break_start || null,
          break_end: form.break_end || null,
        },
      });

      showSnackbar(
        "Registration submitted. Your account is under verification.",
        "success"
      );
      navigate("/doctor/status", { replace: true });
    } catch (err) {
      showSnackbar("Failed to submit registration. Please try again.", "error");
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
          Complete your profile and set your availability.
        </Typography>

        {/* Basic Details */}
        <TextField fullWidth margin="normal" label="Name" name="name" onChange={handleChange} />
        <TextField fullWidth margin="normal" label="Specialization" name="specialization" onChange={handleChange} />
        <TextField fullWidth margin="normal" label="Experience (years)" name="experience" onChange={handleChange} />
        <TextField fullWidth margin="normal" label="Address" name="address" onChange={handleChange} />
        <TextField fullWidth margin="normal" label="Fees" name="fees" onChange={handleChange} />

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3 }}
          disabled={submitting}
          onClick={submit}
        >
          {submitting ? <CircularProgress size={24} /> : "Submit"}
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

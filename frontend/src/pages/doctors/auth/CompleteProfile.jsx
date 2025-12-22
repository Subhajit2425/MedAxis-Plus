import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/api";

import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";

export default function CompleteProfile() {
  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    start_time: "",
    end_time: "",
    slot_duration: 15,
    break_start: "",
    break_end: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // 🔐 Guard: block direct access
  useEffect(() => {
    if (!email) {
      navigate("/login", { replace: true });
    }
  }, [email, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.start_time || !form.end_time) {
      setError("Start time and end time are required");
      return false;
    }

    if (form.start_time >= form.end_time) {
      setError("End time must be after start time");
      return false;
    }

    if (form.slot_duration < 5 || form.slot_duration > 120) {
      setError("Slot duration must be between 5 and 120 minutes");
      return false;
    }

    if (
      (form.break_start && !form.break_end) ||
      (!form.break_start && form.break_end)
    ) {
      setError("Both break start and break end must be provided");
      return false;
    }

    if (
      form.break_start &&
      form.break_end &&
      form.break_start >= form.break_end
    ) {
      setError("Break end must be after break start");
      return false;
    }

    setError("");
    return true;
  };

  const submit = async () => {
    if (!validate()) return;

    setSubmitting(true);

    try {
      await api.post("/api/availability/doctor", {
        email,
        start_time: form.start_time,
        end_time: form.end_time,
        slot_duration: Number(form.slot_duration),
        break_start: form.break_start || null,
        break_end: form.break_end || null,
      });

      setSnackbar({
        open: true,
        message: "Availability saved successfully",
        severity: "success",
      });

      setTimeout(() => {
        navigate("/doctor/dashboard", { replace: true });
      }, 800);
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Failed to save availability",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h5" gutterBottom>
          Complete Your Profile
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Set your working hours and slot duration. This will be used to
          generate appointment slots.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          margin="normal"
          type="time"
          label="Work Start Time"
          name="start_time"
          slotProps={{
            input: { step: 300 },
            inputLabel: { shrink: true }
          }}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          margin="normal"
          type="time"
          label="Work End Time"
          name="end_time"
          slotProps={{
            input: { step: 300 },
            inputLabel: { shrink: true }
          }}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          margin="normal"
          type="number"
          label="Slot Duration (minutes)"
          name="slot_duration"
          value={form.slot_duration}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          margin="normal"
          type="time"
          label="Break Start (optional)"
          name="break_start"
          InputLabelProps={{ shrink: true }}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          margin="normal"
          type="time"
          label="Break End (optional)"
          name="break_end"
          InputLabelProps={{ shrink: true }}
          onChange={handleChange}
        />

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3 }}
          disabled={submitting}
          onClick={submit}
        >
          {submitting ? <CircularProgress size={24} /> : "Save & Continue"}
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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

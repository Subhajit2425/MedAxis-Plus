import React, { useState, useEffect } from "react";
import api from "../../api/api";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Divider,
  Chip
} from "@mui/material";

export default function BookingPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const {
    doctorId,
    doctorName,
    appointmentDate,
    selectedSlot
  } = state || {};

  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    mobile_number: localStorage.getItem("userMobile") || "",
    email: localStorage.getItem("userEmail") || ""
  });

  // 🔐 Guard against direct access
  useEffect(() => {
    if (!doctorId || !selectedSlot || !appointmentDate) {
      navigate("/doctors", { replace: true });
    }
  }, [doctorId, selectedSlot, appointmentDate, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setStatus("loading");

    try {
      await api.post("/api/appointments", {
        doctor_id: doctorId,
        appointment_date: appointmentDate,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        ...formData
      });

      setStatus("success");
      setTimeout(() => navigate("/appointments"), 1500);
    } catch (err) {
      console.error("Booking error:", err);
      setStatus("error");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Card elevation={6} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Confirm Appointment
          </Typography>

          <Typography variant="subtitle1" color="primary" gutterBottom>
            With {doctorName}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* Appointment Summary */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Appointment Details
            </Typography>

            <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Chip
                label={`Date: ${appointmentDate}`}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`${selectedSlot.start_time} - ${selectedSlot.end_time}`}
                color="success"
                variant="outlined"
              />
            </Box>
          </Box>

          {/* Alerts */}
          {status === "success" && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Appointment booked successfully
            </Alert>
          )}

          {status === "error" && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Booking failed. Please try again.
            </Alert>
          )}

          {/* User Details */}
          <form onSubmit={handleSubmit}>
            <TextField
              label="First Name"
              fullWidth
              required
              sx={{ mb: 2 }}
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
            />

            <TextField
              label="Last Name"
              fullWidth
              required
              sx={{ mb: 2 }}
              value={formData.last_name}
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
            />

            <TextField
              label="Mobile Number"
              fullWidth
              disabled
              sx={{ mb: 2 }}
              value={formData.mobile_number}
            />

            <TextField
              label="Email"
              fullWidth
              disabled
              sx={{ mb: 3 }}
              value={formData.email}
            />

            <Button
              type="submit"
              fullWidth
              size="large"
              variant="contained"
              disabled={status === "loading"}
              sx={{
                py: 1.4,
                fontWeight: 600,
                borderRadius: 2
              }}
            >
              {status === "loading" ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Confirm & Book Appointment"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}

import React, { useState, useEffect } from "react";
import api from "../../api/api";
import { useSearchParams, useNavigate } from "react-router-dom";
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
  Grid,
} from "@mui/material";

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const doctorId = searchParams.get("doctorId");
  const doctorName = searchParams.get("doctorName") || "Selected Doctor";

  const [appointmentDate, setAppointmentDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    mobile_number: localStorage.getItem("userMobile") || "",
    email: localStorage.getItem("userEmail") || "",
  });

  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [slotLoading, setSlotLoading] = useState(false);

  useEffect(() => {
    if (!doctorId) navigate("/doctors");
  }, [doctorId, navigate]);

  // 🔹 Fetch slots when date changes
  useEffect(() => {
    if (!appointmentDate) return;

    const fetchSlots = async () => {
      setSlotLoading(true);
      setSelectedSlot(null);

      try {
        const res = await api.get(
          `/api/availability/doctor/${doctorId}/slots`,
          { params: { date: appointmentDate } }
        );
        setSlots(res.data.slots || []);
      } catch (err) {
        console.error("Slot fetch error:", err);
        setSlots([]);
      } finally {
        setSlotLoading(false);
      }
    };

    fetchSlots();
  }, [appointmentDate, doctorId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSlot) {
      alert("Please select a time slot");
      return;
    }

    setStatus("loading");

    try {
      await api.post("/api/appointments", {
        doctor_id: doctorId,
        appointment_date: appointmentDate,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        ...formData,
      });

      setStatus("success");
      setTimeout(() => navigate("/appointments"), 1500);
    } catch (err) {
      console.error("Booking error:", err);
      setStatus("error");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Card elevation={4}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Book Appointment
          </Typography>
          <Typography variant="h6" color="primary" gutterBottom>
            With {doctorName}
          </Typography>

          {status === "success" && (
            <Alert severity="success">Appointment booked successfully</Alert>
          )}
          {status === "error" && (
            <Alert severity="error">Booking failed. Try again.</Alert>
          )}

          <form onSubmit={handleSubmit}>
            {/* Date Picker */}
            <Box mb={2}>
              <TextField
                type="date"
                label="Appointment Date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
              />
            </Box>

            {/* Slots */}
            {slotLoading && <CircularProgress size={24} />}
            {!slotLoading && appointmentDate && (
              <Grid container spacing={1} mb={2}>
                {slots.length === 0 && (
                  <Typography>No slots available</Typography>
                )}
                {slots.map((slot, idx) => (
                  <Grid item xs={6} key={idx}>
                    <Button
                      fullWidth
                      variant={
                        selectedSlot?.start_time === slot.start_time
                          ? "contained"
                          : "outlined"
                      }
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {slot.start_time} - {slot.end_time}
                    </Button>
                  </Grid>
                ))}
              </Grid>
            )}

            {/* User Details */}
            <Box mb={2}>
              <TextField
                label="First Name"
                fullWidth
                required
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
              />
            </Box>

            <Box mb={2}>
              <TextField
                label="Last Name"
                fullWidth
                required
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
              />
            </Box>

            <Box mb={2}>
              <TextField
                label="Mobile Number"
                fullWidth
                disabled
                value={formData.mobile_number}
              />
            </Box>

            <Box mb={2}>
              <TextField
                label="Email"
                fullWidth
                disabled
                value={formData.email}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <CircularProgress size={24} />
              ) : (
                "Confirm Booking"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/api";

import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";

export default function SlotBooking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const doctorId = searchParams.get("doctorId");
  const doctorName = searchParams.get("doctorName") || "Doctor";

  const [appointmentDate, setAppointmentDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!doctorId) navigate("/doctors");
  }, [doctorId, navigate]);

  // 🔹 Fetch slots on date change
  useEffect(() => {
    if (!appointmentDate) return;

    const fetchSlots = async () => {
      setLoading(true);
      setSelectedSlot(null);
      setError("");

      try {
        const res = await api.get(
          `/api/availability/doctor/${doctorId}/slots`,
          { params: { date: appointmentDate } }
        );
        setSlots(res.data.slots || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load slots");
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [appointmentDate, doctorId]);

  const handleContinue = () => {
    if (!selectedSlot) return;

    navigate("/doctors/book-appointment", {
      state: {
        doctorId,
        doctorName,
        appointmentDate,
        selectedSlot,
      },
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Card elevation={5} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Select Appointment Slot
          </Typography>

          <Typography color="primary" gutterBottom>
            With {doctorName}
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Date Picker */}
          <Box mb={3}>
            <TextField
              type="date"
              label="Choose Appointment Date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
            />
          </Box>

          {/* Slot Loader */}
          {loading && (
            <Box display="flex" justifyContent="center" my={3}>
              <CircularProgress />
            </Box>
          )}

          {/* Error */}
          {error && <Alert severity="error">{error}</Alert>}

          {/* Slots */}
          {!loading && appointmentDate && (
            <>
              <Typography fontWeight={500} mb={2}>
                Available Slots
              </Typography>

              {slots.length === 0 && (
                <Alert severity="info">No slots available for this day</Alert>
              )}

              <Grid container spacing={2}>
                {slots.map((slot, idx) => {
                  const isSelected =
                    selectedSlot?.start_time === slot.start_time;

                  return (
                    <Grid item xs={6} sm={4} md={3} key={idx}>
                      <Chip
                        label={`${slot.start_time} - ${slot.end_time}`}
                        clickable
                        color={isSelected ? "primary" : "default"}
                        variant={isSelected ? "filled" : "outlined"}
                        disabled={!slot.available}
                        onClick={() => setSelectedSlot(slot)}
                        sx={{
                          width: "100%",
                          py: 2.5,
                          fontSize: "0.9rem",
                          borderRadius: 2,
                        }}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            </>
          )}

          {/* Selected Summary */}
          {selectedSlot && (
            <Box
              mt={4}
              p={2}
              sx={{
                background: "#f5f7fb",
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Selected Slot
              </Typography>
              <Typography fontWeight={600}>
                {appointmentDate} • {selectedSlot.start_time} –{" "}
                {selectedSlot.end_time}
              </Typography>
            </Box>
          )}

          {/* Continue */}
          <Box mt={4}>
            <Button
              fullWidth
              size="large"
              variant="contained"
              disabled={!selectedSlot}
              onClick={handleContinue}
            >
              Continue
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

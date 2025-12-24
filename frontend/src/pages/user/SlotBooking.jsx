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
  const [showSlots, setShowSlots] = useState(false);

  useEffect(() => {
    if (!doctorId) navigate("/doctors");
  }, [doctorId, navigate]);

  /* ================= HELPERS ================= */

  const todayStr = new Date().toISOString().split("T")[0];

  const isPastDate = (date) => date < todayStr;

  const isToday = appointmentDate === todayStr;

  const isPastTime = (time) => {
    const now = new Date();
    const [h, m] = time.split(":").map(Number);
    const slotTime = new Date();
    slotTime.setHours(h, m, 0, 0);
    return slotTime < now;
  };

  /* ================= FETCH SLOTS ================= */

  const handleFetchSlots = async () => {
    setError("");
    setSlots([]);
    setSelectedSlot(null);
    setShowSlots(false);

    if (!appointmentDate) {
      setError("Please select a date");
      return;
    }

    if (isPastDate(appointmentDate)) {
      setError("You cannot select a past date");
      return;
    }

    setLoading(true);

    try {
      const res = await api.get(
        `/api/availability/doctor/${doctorId}/slots`,
        { params: { date: appointmentDate } }
      );
      setSlots(res.data.slots || []);
      setShowSlots(true);
    } catch {
      setError("Failed to load available slots");
    } finally {
      setLoading(false);
    }
  };

  /* ================= CONTINUE ================= */

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
      <Card elevation={4} sx={{ borderRadius: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Select Appointment Slot
          </Typography>

          <Typography color="primary" gutterBottom>
            With Dr. {doctorName}
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* DATE PICKER */}
          <Box mb={2}>
            <TextField
              type="date"
              label="Appointment Date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={appointmentDate}
              onChange={(e) => {
                setAppointmentDate(e.target.value);
                setShowSlots(false);
                setSlots([]);
                setError("");
              }}
            />
          </Box>

          {/* CHECK SLOTS BUTTON */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleFetchSlots}
          >
            Check Available Slots
          </Button>
          

          {/* LOADER */}
          {loading && (
            <Box display="flex" justifyContent="center" my={3}>
              <CircularProgress />
            </Box>
          )}

          {/* ERROR */}
          {error && <Alert severity="error">{error}</Alert>}

          {/* SLOTS */}
          {showSlots && !loading && (
            <>
              <Typography fontWeight={600} mb={2}>
                Available Slots
              </Typography>

              {slots.length === 0 && (
                <Alert severity="info">No slots available for this date</Alert>
              )}

              <Grid container spacing={2}>
                {slots.map((slot, idx) => {
                  const disabled =
                    !slot.available ||
                    (isToday && isPastTime(slot.start_time));

                  const isSelected =
                    selectedSlot?.start_time === slot.start_time;

                  return (
                    <Grid item xs={6} sm={4} md={3} key={idx}>
                      <Chip
                        label={`${slot.start_time} - ${slot.end_time}`}
                        clickable
                        disabled={disabled}
                        color={isSelected ? "primary" : "default"}
                        variant={isSelected ? "filled" : "outlined"}
                        onClick={() => setSelectedSlot(slot)}
                        sx={{
                          width: "100%",
                          py: 2.5,
                          fontSize: "0.9rem",
                          borderRadius: 2,
                          opacity: disabled ? 0.4 : 1,
                        }}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            </>
          )}

          {/* SELECTED SUMMARY */}
          {selectedSlot && (
            <Box
              mt={4}
              p={2}
              sx={{ background: "#f5f7fb", borderRadius: 2 }}
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

          {/* CONTINUE */}
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

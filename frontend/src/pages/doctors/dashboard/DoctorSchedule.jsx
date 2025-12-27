import React, { useEffect, useState } from "react";
import api from "../../../api/api";
import {
  Container,
  Typography,
  Card,
  Box,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Divider,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";
import EventBusyIcon from "@mui/icons-material/EventBusy";

export default function DoctorDailySchedule() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const now = new Date();

  useEffect(() => {
    api
      .get("/api/doctor/appointments/today")
      .then((res) => {
        setAppointments(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load today's schedule");
        setLoading(false);
      });
  }, []);

  const markCompleted = async (id) => {
    try {
      await api.put(`/api/doctor/appointments/${id}/complete`);
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, status: "completed" } : a
        )
      );
    } catch {
      alert("Failed to update appointment");
    }
  };

  const isPastSlot = (endTime) => {
    const [h, m] = endTime.split(":");
    const slotTime = new Date();
    slotTime.setHours(h, m, 0);
    return slotTime <= now;
  };

  if (loading) {
    return (
      <Container sx={{ mt: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography mt={2}>Loading today’s schedule…</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 6 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      {/* HEADER */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700}>
          Today’s Schedule
        </Typography>
        <Typography color="text.secondary">
          {today}
        </Typography>
      </Box>

      {/* EMPTY STATE */}
      {appointments.length === 0 && (
        <Alert severity="info">
          No appointments scheduled for today.
        </Alert>
      )}

      {/* APPOINTMENTS */}
      <Grid container spacing={3}>
        {appointments.map((a) => {
          const canComplete =
            a.status === "approved" && isPastSlot(a.end_time);

          return (
            <Grid item xs={12} key={a.id}>
              <Card
                sx={{
                  p: 3,
                  borderRadius: 3,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography fontWeight={600}>
                    {a.first_name} {a.last_name}
                  </Typography>

                  <Typography color="text.secondary" fontSize={14}>
                    {a.start_time} – {a.end_time}
                  </Typography>

                  <Box mt={1}>
                    {a.status === "approved" && (
                      <Chip
                        icon={<ScheduleIcon />}
                        label="Approved"
                        color="primary"
                        size="small"
                      />
                    )}
                    {a.status === "completed" && (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Completed"
                        color="success"
                        size="small"
                      />
                    )}
                    {a.status === "missed" && (
                      <Chip
                        icon={<EventBusyIcon />}
                        label="Missed"
                        color="error"
                        size="small"
                      />
                    )}
                  </Box>
                </Box>

                {/* ACTION */}
                <Box>
                  {canComplete ? (
                    <Button
                      variant="contained"
                      onClick={() => markCompleted(a.id)}
                    >
                      Mark Completed
                    </Button>
                  ) : (
                    <Button disabled variant="outlined">
                      {a.status === "approved"
                        ? "Upcoming"
                        : "Locked"}
                    </Button>
                  )}
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}

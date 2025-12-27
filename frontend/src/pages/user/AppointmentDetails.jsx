import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/api";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Divider,
  Button,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import EventIcon from "@mui/icons-material/Event";
import ScheduleIcon from "@mui/icons-material/Schedule";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

export default function AppointmentDetails() {
  const { id } = useParams(); // appointment id from URL
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ---------------- FETCH APPOINTMENT ---------------- */

  useEffect(() => {
    if (!userEmail) {
      navigate("/login", { replace: true });
      return;
    }

    api
      .get(`/api/appointments/${id}`, {
        params: { email: userEmail },
      })
      .then((res) => {
        setAppointment(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load appointment details.");
        setLoading(false);
      });
  }, [id, userEmail, navigate]);

  /* ---------------- UI STATES ---------------- */

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 8 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }} color="text.secondary">
          Loading appointment details…
        </Typography>
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

  if (!appointment) return null;

  /* ---------------- DATA ---------------- */

  const {
    doctor_id,
    doctor_name,
    first_name,
    last_name,
    mobile_number,
    email,
    appointment_date,
    start_time,
    end_time,
    status,
    created_at,
  } = appointment;

  const statusColor =
    status === "pending"
      ? "#f59e0b"
      : status === "approved"
      ? "#16a34a"
      : status === "cancelled"
      ? "#64748b"
      : "#dc2626";

  /* ---------------- UI ---------------- */

  return (
    <Container sx={{ mt: 6, mb: 6, maxWidth: "sm" }}>
      <Card elevation={4} sx={{ borderRadius: 4, overflow: "hidden" }}>
        {/* Header */}
        <Box
          sx={{
            background:
              "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
            color: "#fff",
            px: 3,
            py: 2.5,
          }}
        >
          <Stack spacing={0.5}>
            <Typography variant="h6" fontWeight={700}>
              Appointment Details
            </Typography>
            <Typography sx={{ opacity: 0.9 }}>
              Dr. {doctor_name}
            </Typography>
          </Stack>
        </Box>

        <CardContent>
          <Stack spacing={2.5}>
            {/* Status */}
            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight={600}>Status</Typography>
              <Chip
                label={status.toUpperCase()}
                sx={{
                  fontWeight: 600,
                  color: "#fff",
                  backgroundColor: statusColor,
                }}
              />
            </Stack>

            <Divider />

            {/* Patient Info */}
            <Stack spacing={1.2}>
              <Typography fontWeight={700}>Patient Information</Typography>

              <Stack direction="row" spacing={1} alignItems="center">
                <PersonIcon fontSize="small" />
                <Typography>
                  {first_name} {last_name}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <PhoneIcon fontSize="small" />
                <Typography>{mobile_number}</Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <EmailIcon fontSize="small" />
                <Typography>{email}</Typography>
              </Stack>
            </Stack>

            <Divider />

            {/* Appointment Info */}
            <Stack spacing={1.2}>
              <Typography fontWeight={700}>Appointment Info</Typography>

              <Stack direction="row" spacing={1} alignItems="center">
                <EventIcon fontSize="small" />
                <Typography>
                  {new Date(appointment_date).toLocaleDateString(undefined, {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <ScheduleIcon fontSize="small" />
                <Typography>
                  {start_time} – {end_time}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <LocalHospitalIcon fontSize="small" />
                <Typography>
                  Created on{" "}
                  {new Date(created_at).toLocaleDateString()}
                </Typography>
              </Stack>
            </Stack>

            <Divider />

            {/* Action */}
            <Button
              variant="contained"
              size="large"
              sx={{
                borderRadius: 3,
                py: 1.2,
                textTransform: "none",
                fontWeight: 600,
              }}
              onClick={() => navigate(`/doctors/${doctor_id}`)}
            >
              View Doctor Profile
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}

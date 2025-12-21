import { useEffect, useState } from "react";
import api from "../../../api/api";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
} from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PersonIcon from "@mui/icons-material/Person";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail");

  const [access, setAccess] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔐 Doctor access check
  useEffect(() => {
    if (!email) {
      navigate("/login", { replace: true });
      return;
    }

    api
      .get("/api/doctor/access", { params: { email } })
      .then((res) => {
        setAccess(res.data);

        if (res.data.canAccessBooking) {
          fetchDoctorProfile();
          fetchAppointments();
        }
      })
      .catch(() => setAccess({ error: true }))
      .finally(() => setLoading(false));
  }, [email, navigate]);

  const fetchAppointments = async () => {
    const res = await api.get("/api/doctor/appointments", {
      params: { email, status: "pending" },
    });
    setAppointments(res.data.appointments || []);
  };

  const fetchDoctorProfile = async () => {
    const res = await api.get("/api/doctor/profile", {
      params: { email },
    });
    setDoctor(res.data.doctor);
  };

  const updateAppointmentStatus = async (id, status) => {
    try {
      await api.put(
        `/api/doctor/appointments/${id}`,
        { status }, // confirmed | rejected
        { params: { email } }
      );
      fetchAppointments();
    } catch {
      alert("Failed to update appointment status");
    }
  };

  // ---------------- UI STATES ----------------

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 8 }}>
        <CircularProgress size={40} />
        <Typography sx={{ mt: 2 }} color="text.secondary">
          Loading doctor dashboard…
        </Typography>
      </Container>
    );
  }

  if (!access || access.error) {
    return <Alert severity="error">Failed to load dashboard</Alert>;
  }

  if (!access.registered) {
    return (
      <Container sx={{ mt: 8 }}>
        <Alert severity="info">
          No doctor profile found. Please register.
        </Alert>
      </Container>
    );
  }

  if (access.requestStatus === "pending") {
    return (
      <Container sx={{ mt: 8 }}>
        <Alert severity="warning">
          Your profile is under review.
        </Alert>
      </Container>
    );
  }

  if (access.requestStatus === "rejected") {
    return (
      <Container sx={{ mt: 8 }}>
        <Alert severity="error">
          Your application was rejected.
        </Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate("/doctor/register")}>
          Re-apply
        </Button>
      </Container>
    );
  }

  if (!doctor) {
    return (
      <Container sx={{ textAlign: "center", mt: 8 }}>
        <CircularProgress size={40} />
      </Container>
    );
  }

  // ---------------- APPROVED DASHBOARD ----------------

  return (
    <Container sx={{ mt: 4 }}>
      {/* Doctor Header */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <PersonIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5">Dr. {doctor.name}</Typography>
              <Typography color="text.secondary">
                {doctor.specialization} • {doctor.experience} yrs
              </Typography>
            </Box>
            <Chip label="Verified" color="success" sx={{ ml: "auto" }} />
          </Stack>
        </CardContent>
      </Card>

      {/* Appointments */}
      <Typography variant="h6" gutterBottom>
        Pending Appointments
      </Typography>

      {appointments.length === 0 ? (
        <Alert severity="info">No pending appointments.</Alert>
      ) : (
        <Stack spacing={2}>
          {appointments.map((appt) => (
            <Card key={appt.id} variant="outlined">
              <CardContent>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}
                >
                  <Box>
                    <Typography fontWeight={600}>
                      <EventAvailableIcon fontSize="small" />{" "}
                      {appt.first_name} {appt.last_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      📅 {appt.appointment_date} | ⏰{" "}
                      {appt.start_time} - {appt.end_time}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      📞 {appt.mobile_number}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() =>
                        updateAppointmentStatus(appt.id, "confirmed")
                      }
                    >
                      Confirm
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() =>
                        updateAppointmentStatus(appt.id, "rejected")
                      }
                    >
                      Reject
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}

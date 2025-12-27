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
  TextField,
  Divider,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail");

  const [access, setAccess] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  /* ---------------- ACCESS CHECK ---------------- */

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
        }
      })
      .catch(() => setAccess({ error: true }))
      .finally(() => setLoading(false));
  }, [email, navigate]);

  /* ---------------- DATA ---------------- */

  const fetchDoctorProfile = async () => {
    const res = await api.get("/api/doctor/profile", {
      params: { email },
    });
    setDoctor(res.data.doctor);
  };

  const fetchAppointments = async () => {
    const res = await api.get("/api/doctor/appointments", {
      params: {
        email,
        status: filter === "all" ? undefined : filter,
        date: selectedDate || undefined,
      },
    });
    setAppointments(res.data.appointments || []);
  };

  useEffect(() => {
    if (doctor) {
      fetchAppointments();
    }
  }, [filter, selectedDate, doctor]);

  const updateAppointmentStatus = async (id, status) => {
    try {
      await api.put(
        `/api/doctor/appointments/${id}`,
        { status },
        { params: { email } }
      );
      fetchAppointments();
    } catch {
      alert("Failed to update appointment status");
    }
  };

  /* ---------------- UI STATES ---------------- */

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!access || access.error) {
    return <Alert severity="error">Failed to load dashboard</Alert>;
  }

  if (!access.registered) {
    return <Alert severity="info">Please register as a doctor.</Alert>;
  }

  if (access.requestStatus !== "approved") {
    return (
      <Alert severity="warning">
        Your profile is under review or rejected.
      </Alert>
    );
  }

  if (!doctor) return null;

  /* ---------------- DASHBOARD ---------------- */

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      {/* Doctor Card */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <PersonIcon sx={{ fontSize: 44 }} />
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Dr. {doctor.name}
              </Typography>
              <Typography color="text.secondary">
                {doctor.specialization} • {doctor.experience} yrs
              </Typography>
            </Box>
            <Chip
              label="Verified"
              color="info"
              sx={{ ml: "auto", fontWeight: 600 }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent>
          <Stack spacing={3}>
            {/* Date Picker */}
            <Box>
              <Typography fontWeight={600} mb={1}>
                Select Date
              </Typography>
              <TextField
                type="date"
                size="small"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </Box>

            <Divider />

            {/* Status Filters */}
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {[
                { label: "All", value: "all" },
                { label: "Approved", value: "approved" },
                { label: "Pending", value: "pending" },
                { label: "Rejected", value: "rejected" },
                { label: "Cancelled", value: "cancelled" },
              ].map((btn) => (
                <Button
                  key={btn.value}
                  variant={filter === btn.value ? "contained" : "outlined"}
                  onClick={() => setFilter(btn.value)}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 999,
                  }}
                >
                  {btn.label}
                </Button>
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Appointments */}
      {appointments.length === 0 ? (
        <Alert severity="info">
          No {filter !== "all" ? filter : ""} appointments found.
        </Alert>
      ) : (
        <Stack spacing={2}>
          {appointments.map((appt) => (
            <Card key={appt.id} variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Box>
                    <Typography fontWeight={600}>
                      <EventAvailableIcon fontSize="small" />{" "}
                      {appt.first_name} {appt.last_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      📅 {appt.appointment_date} | ⏰ {appt.start_time} -{" "}
                      {appt.end_time}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      📞 {appt.mobile_number}
                    </Typography>
                  </Box>

                  {appt.status === "pending" && (
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        color="info"
                        onClick={() =>
                          updateAppointmentStatus(appt.id, "approved")
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() =>
                          updateAppointmentStatus(appt.id, "rejected")
                        }
                      >
                        Reject
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}

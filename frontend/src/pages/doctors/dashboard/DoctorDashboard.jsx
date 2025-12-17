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
  Divider
} from "@mui/material";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PersonIcon from "@mui/icons-material/Person";

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail");

  const [status, setStatus] = useState("loading");
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔐 Auth check
  useEffect(() => {
    if (!email) {
      navigate("/login", { replace: true });
      return;
    }

    api
      .get("/api/doctor/access", { params: { email } })
      .then((res) => {
        if (!res.data.registered) {
          setStatus("not_registered");
          return;
        }

        setStatus(res.data.status);

        if (res.data.status === "approved") {
          fetchDoctorProfile();
          fetchAppointments();
        }
      })

      .catch(() => setStatus("error"))
      .finally(() => setLoading(false));
  }, [email, navigate]);


  const fetchAppointments = async () => {
    const res = await api.get("/api/doctor/appointments", {
      params: { email }
    });
    setAppointments(res.data);
  };

  const fetchDoctorProfile = async () => {
    const res = await api.get("/api/doctor/profile", {
      params: { email }
    });
    setDoctor(res.data);
  };


  const updateAppointmentStatus = async (id, action) => {
    try {
      const doctorEmail = localStorage.getItem("userEmail");

      await api.put(
        `/api/doctor/appointments/${id}`,
        { status: action },
        {
          params: { email: doctorEmail } // 🔥 THIS WAS MISSING
        }
      );

      fetchAppointments(); // refresh list
    } catch (err) {
      console.error("Failed to update appointment:", err);
      alert("Failed to update appointment status");
    }
  };


  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === "error") {
    return (
      <Alert severity="error">
        Failed to load doctor dashboard. Please try again.
      </Alert>
    );
  }

  // ⏳ Pending
  if (status === "pending") {
    return (
      <Container sx={{ mt: 8 }}>
        <Alert severity="warning">
          Your doctor profile is under review. This usually takes 24–48 hours.
        </Alert>
      </Container>
    );
  }

  // ❌ Rejected
  if (status === "rejected") {
    return (
      <Container sx={{ mt: 8 }}>
        <Alert severity="error">
          Your application was rejected. Please update details and re-apply.
        </Alert>

        <Button sx={{ mt: 2 }} onClick={() => navigate("/doctor/register")}>
          Re-apply
        </Button>
      </Container>
    );
  }

  // ❓ Not registered
  if (status === "not_registered") {
    return (
      <Container sx={{ mt: 8 }}>
        <Alert severity="info">
          No doctor profile found. Please register to continue.
        </Alert>
      </Container>
    );
  }

  // ✅ Approved but doctor profile not loaded yet
  if (status === "approved" && !doctor) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }


  // ✅ APPROVED DASHBOARD
  return (
    <Container sx={{ mt: 4 }}>
      {/* Doctor Header */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <PersonIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5">
                Dr. {doctor.name}
              </Typography>
              <Typography color="text.secondary">
                {doctor.specialization} • {doctor.experience} yrs experience
              </Typography>
            </Box>
            <Chip
              label="Verified"
              color="info"
              sx={{ ml: "auto" }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Appointments Section */}
      <Typography variant="h6" gutterBottom>
        Appointments
      </Typography>

      {appointments.length === 0 ? (
        <Alert severity="info">
          No appointments yet.
        </Alert>
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
                      📞 {appt.mobile_number}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      color="info"
                      size="small"
                      onClick={() =>
                        updateAppointmentStatus(appt.id, "approved")
                      }
                    >
                      Approve
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

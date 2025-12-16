import { useEffect, useState } from "react";
import api from "../../../api/api";
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent
} from "@mui/material";

export default function DoctorDashboard() {
  const email = localStorage.getItem("doctorEmail");

  const [status, setStatus] = useState("loading");
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    if (!email) {
      window.location.href = "/doctor/login";
      return;
    }

    api
      .get("/api/doctor/status", { params: { email } })
      .then((res) => {
        setStatus(res.data.status);
        setDoctor(res.data.doctor || null);
      })
      .catch(() => setStatus("error"));
  }, [email]);

  if (status === "loading") {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ mt: 6 }}>
      {/* ⏳ Pending */}
      {status === "pending" && (
        <Alert severity="warning">
          Your application is under review. We will notify you once approved.
        </Alert>
      )}

      {/* ❌ Rejected */}
      {status === "rejected" && (
        <Alert severity="error">
          Your application was rejected. Please contact support for details.
        </Alert>
      )}

      {/* ✅ Approved */}
      {status === "approved" && doctor && (
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Welcome, Dr. {doctor.name}
            </Typography>

            <Typography>
              Specialization: {doctor.specialization}
            </Typography>

            <Typography>
              Experience: {doctor.experience}
            </Typography>

            <Typography sx={{ mt: 2 }}>
              🎉 Your account is approved. You can now manage appointments.
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* ❓ Not registered */}
      {status === "not_registered" && (
        <Alert severity="info">
          No doctor application found. Please register.
        </Alert>
      )}
    </Container>
  );
}

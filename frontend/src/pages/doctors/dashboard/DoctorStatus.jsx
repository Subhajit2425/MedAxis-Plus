import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Chip,
  Button,
  Alert
} from "@mui/material";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import api from "../../../api/api";
import { useNavigate } from "react-router-dom";

export default function DoctorStatus() {
  const [status, setStatus] = useState("loading");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const email = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!email) {
      navigate("/login");
      return;
    }

    api
      .get("/api/doctor/status", { params: { email } })
      .then((res) => {
        setStatus(res.data.status);
      })
      .catch(() => {
        setStatus("error");
      })
      .finally(() => setLoading(false));
  }, [email, navigate]);

  const renderStatus = () => {
    switch (status) {
      case "pending":
        return {
          icon: <HourglassTopIcon sx={{ fontSize: 48, color: "#f59e0b" }} />,
          chip: <Chip label="Pending Verification" color="warning" />,
          text:
            "Your registration has been submitted successfully. Our team is reviewing your details. This usually takes 24–48 hours."
        };

      case "approved":
        return {
          icon: <CheckCircleIcon sx={{ fontSize: 48, color: "#16a34a" }} />,
          chip: <Chip label="Approved" color="success" />,
          text:
            "Congratulations! Your doctor account has been approved. You can now access your professional dashboard."
        };

      case "rejected":
        return {
          icon: <CancelIcon sx={{ fontSize: 48, color: "#dc2626" }} />,
          chip: <Chip label="Rejected" color="error" />,
          text:
            "Unfortunately, your registration was not approved. This may be due to incomplete or unverifiable information."
        };

      default:
        return {};
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === "error") {
    return (
      <Alert severity="error" sx={{ maxWidth: 500, mx: "auto", mt: 8 }}>
        Failed to fetch doctor status. Please try again later.
      </Alert>
    );
  }

  const ui = renderStatus();

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 56px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #f5f7fb, #e0f2fe)",
        px: 2
      }}
    >
      <Card
        sx={{
          maxWidth: 520,
          width: "100%",
          borderRadius: 4,
          boxShadow: "0 20px 40px rgba(0,0,0,0.08)"
        }}
      >
        <CardContent sx={{ p: 4, textAlign: "center" }}>
          {ui.icon}

          <Typography variant="h4" fontWeight={700} sx={{ mt: 2 }}>
            Doctor Registration Status
          </Typography>

          <Box sx={{ mt: 2 }}>{ui.chip}</Box>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 3 }}
          >
            {ui.text}
          </Typography>

          {/* Actions */}
          {status === "approved" && (
            <Button
              variant="contained"
              size="large"
              sx={{ mt: 4 }}
              onClick={() => navigate("/doctor/complete-profile")}
            >
              Complete Profile
            </Button>
          )}

          {status === "rejected" && (
            <Button
              variant="outlined"
              sx={{ mt: 4 }}
              onClick={() => navigate("/doctor/register")}
            >
              Re-apply as Doctor
            </Button>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

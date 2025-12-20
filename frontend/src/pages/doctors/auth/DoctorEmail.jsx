import { useEffect, useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Snackbar,
} from "@mui/material";
import api from "../../../api/api";
import { useNavigate } from "react-router-dom";

export default function DoctorEmail() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDevOtp, setIsDevOtp] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" // success | error | warning | info
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar(prev => ({ ...prev, open: false }));
    setTimeout(() => {
      setSnackbar({ open: true, message, severity });
    }, 50);
  };

  // 🔹 Pre-fill email from localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem("userEmail");
    if (!savedEmail) {
      navigate("/login");
    } else {
      setEmail(savedEmail);
    }
  }, [navigate]);

  // 🔹 Send OTP
  const handleSendOtp = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.post("/api/doctor/send-otp", { email });

      setOtpSent(true);

      // ✅ DEV MODE → auto-fill OTP
      if (res.data.devOtp) {
        setOtp(res.data.devOtp);
        setIsDevOtp(true);
      } else {
        setIsDevOtp(false);
      }

    } catch (err) {
      showSnackbar("Failed to send verification code. Try again.", "error");
    } finally {
      setLoading(false);
    }
  };


  // 🔹 Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp) {
      showSnackbar("Please enter verification code.", "error");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/api/doctor/verify-otp", {
        email,
        otp
      });

      /**
       * Expected backend response:
       * { action: "LOGIN" | "REGISTER" | "PENDING" }
       */

      if (res.data.action === "LOGIN") {
        localStorage.setItem("role", "doctor");
        navigate("/doctor/dashboard");
      }

      if (res.data.action === "REGISTER") {
        navigate("/doctor/register", { state: { email } });
      }

      if (res.data.action === "PENDING") {
        showSnackbar("Your account is under verification. Please wait for approval.", "info");
      }
    } catch (err) {
      showSnackbar("Invalid or expired verification code", "success");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Doctor Verification
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Verify your professional email to continue as a doctor on MedAxis+.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Email (Read-only) */}
        <TextField
          fullWidth
          label="Professional Email"
          margin="normal"
          value={email}
          disabled
        />

        {/* Send OTP */}
        {!otpSent && (
          <Button
            fullWidth
            variant="contained"
            onClick={handleSendOtp}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            Send Verification Code
          </Button>
        )}

        {/* OTP Section */}
        {otpSent && (
          <>
            <TextField
              fullWidth
              label="Verification Code"
              margin="normal"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            {isDevOtp && (
              <Typography
                variant="caption"
                sx={{ color: "#d97706", mt: 1, display: "block" }}
              >
                ⚠ Development mode: OTP auto-filled for testing
              </Typography>
            )}

            <Button
              fullWidth
              variant="contained"
              onClick={handleVerifyOtp}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              Verify & Continue
            </Button>
          </>
        )}

      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }} // 🔥 TOP is key
        onClose={(event, reason) => {
          if (reason === "clickaway") return;
          setSnackbar({ ...snackbar, open: false });
        }}
        sx={{ zIndex: 2000 }} // 🔥 FORCE visibility
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{
            borderRadius: 2,
            boxShadow: 6,
            width: "100%"
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

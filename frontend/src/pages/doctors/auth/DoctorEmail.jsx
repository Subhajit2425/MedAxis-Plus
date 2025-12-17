import { useEffect, useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert
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

      await api.post("/api/doctor/send-otp", { email });
      setOtpSent(true);
    } catch (err) {
      setError("Failed to send verification code. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Verify OTP
  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("Please enter verification code");
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
        setError("Your account is under verification. Please wait for approval.");
      }
    } catch (err) {
      setError("Invalid or expired verification code");
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
    </Container>
  );
}

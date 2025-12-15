import React, { useState, useEffect } from "react";
import api from "../api";

import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    email: "",
    dateOfBirth: "",
  });

  // 🔥 Redirect if already logged in
  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ STEP 1: SEND OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      await api.post("/api/send-otp", formData);
      setOtpSent(true);
      setStatus("idle");
      alert("Verification code sent to your email");
    } catch {
      setStatus("error");
    }
  };

  // ✅ STEP 2: VERIFY OTP
  const handleVerifyOtp = async () => {
    setStatus("loading");

    try {
      await api.post("/api/verify-otp", {
        email: formData.email,
        otp,
      });

      localStorage.setItem("userEmail", formData.email);
      localStorage.setItem("userMobile", formData.mobileNumber);
      navigate("/", { replace: true });
    } catch {
      alert("Invalid or expired verification code");
      setStatus("idle");
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Card elevation={4}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Login / Sign up
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            If this email is already registered, we’ll log you into your existing account.
          </Typography>

          {status === "error" && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Something went wrong. Please try again.
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box mb={2}>
              <TextField
                label="First Name"
                name="firstName"
                fullWidth
                required
                value={formData.firstName}
                onChange={handleChange}
                disabled={otpSent}
              />
            </Box>

            <Box mb={2}>
              <TextField
                label="Last Name"
                name="lastName"
                fullWidth
                required
                value={formData.lastName}
                onChange={handleChange}
                disabled={otpSent}
              />
            </Box>

            <Box mb={2}>
              <TextField
                label="Mobile Number"
                name="mobileNumber"
                fullWidth
                required
                value={formData.mobileNumber}
                onChange={handleChange}
                disabled={otpSent}
              />
            </Box>

            <Box mb={2}>
              <TextField
                label="Email"
                name="email"
                type="email"
                fullWidth
                required
                value={formData.email}
                onChange={handleChange}
                disabled={otpSent}
              />
            </Box>

            <Box mb={3}>
              <TextField
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={formData.dateOfBirth}
                onChange={handleChange}
                disabled={otpSent}
              />
            </Box>

            {/* OTP INPUT */}
            {otpSent && (
              <Box mb={2}>
                <TextField
                  label="Verification Code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  fullWidth
                  required
                />
              </Box>
            )}

            {/* BUTTONS */}
            {!otpSent ? (
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={status === "loading"}
              >
                {status === "loading" ? <CircularProgress size={24} /> : "Continue"}
              </Button>
            ) : (
              <Button
                variant="contained"
                fullWidth
                onClick={handleVerifyOtp}
                disabled={status === "loading"}
              >
                {status === "loading" ? <CircularProgress size={24} /> : "Verify & Login"}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}

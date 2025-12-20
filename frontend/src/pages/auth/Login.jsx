import React, { useState, useEffect } from "react";
import api from "../../api/api";

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
  Divider,
  Link,
  Snackbar,
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [isDevOtp, setIsDevOtp] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" // success | error | warning | info
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };


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
    if (status === "loading") return;
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await api.post("/api/send-otp", formData);

      // ✅ DEV MODE → auto-fill OTP
      if (res.data.devOtp) {
        setOtp(res.data.devOtp);
        setIsDevOtp(true);
      } else {
        setIsDevOtp(false);

        // 🔥 SHOW SNACKBAR FIRST
        
        showSnackbar("Verification code sent to your email", "success");
      }

      // 🔥 UI STATE AFTER SNACKBAR
      setOtpSent(true);
      setStatus("idle");

    } catch (err) {
      console.error(err);
      
      showSnackbar("Failed to send verification code. Please try again.", "error");
      setStatus("idle");
    }
  };



  // ✅ STEP 2: VERIFY OTP
  const handleVerifyOtp = async () => {
    if (status === "loading") return;
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
      showSnackbar("Invalid or expired verification code", "error");
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

                {isDevOtp && (
                  <Typography
                    variant="caption"
                    sx={{ color: "#d97706", mt: 1, display: "block" }}
                  >
                    ⚠ Development mode: OTP auto-filled for testing
                  </Typography>
                )}
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
                disabled={status === "loading" || otp.length !== 6}
              >
                {status === "loading" ? <CircularProgress size={24} /> : "Verify & Login"}
              </Button>
            )}
          </form>
          {/* ───────── Doctor Login Option ───────── */}
          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" align="center" color="text.secondary">
            Are you a doctor?
          </Typography>

          <Box textAlign="center" mt={1}>
            <Link
              component={RouterLink}
              to="/doctor/login"
              underline="hover"
              sx={{
                fontWeight: 600,
                fontSize: "0.95rem",
                cursor: "pointer",
              }}
            >
              Login as a Doctor
            </Link>
          </Box>

        </CardContent>
      </Card>

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

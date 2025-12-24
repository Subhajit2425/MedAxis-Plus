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
import { useLocation, useNavigate, Link as RouterLink } from "react-router-dom";

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading
  const [isDevOtp, setIsDevOtp] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar(prev => ({ ...prev, open: false }));

    setTimeout(() => {
      setSnackbar(prev => ({
        ...prev,
        open: true,
        message,
        severity
      }));
    }, 50);
  };

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    email: "",
    dateOfBirth: "",
  });

  const snackbarShownRef = React.useRef(false);

  useEffect(() => {
    if (location.state?.snackbar && !snackbarShownRef.current) {
      snackbarShownRef.current = true;

      const { message, severity } = location.state.snackbar;
      showSnackbar(message, severity);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);



  // 🔒 Redirect if already logged in
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
    if (status === "loading") return;

    // 🔐 Basic validations
    if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
      showSnackbar("Enter a valid 10-digit mobile number", "warning");
      return;
    }

    setStatus("loading");

    try {
      const res = await api.post("/api/auth/send-otp", formData);

      // DEV MODE → auto-fill OTP
      if (res.data?.devOtp) {
        setOtp(res.data.devOtp);
        setIsDevOtp(true);
        showSnackbar("OTP auto-filled (development mode)", "info");
      } else {
        setIsDevOtp(false);
        showSnackbar("Verification code sent to your email", "success");
      }

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

    if (otp.length !== 6) {
      showSnackbar("Verification code must be of 6 digits.", "warning");
      return;
    }

    setStatus("loading");

    try {
      await api.post("/api/auth/verify-otp", {
        email: formData.email,
        otp,
      });

      // ✅ Persist minimal auth data
      localStorage.setItem("userEmail", formData.email);
      localStorage.setItem("userMobile", formData.mobileNumber);

      // 🧹 Clear sensitive state
      setOtp("");
      setFormData({
        firstName: "",
        lastName: "",
        mobileNumber: "",
        email: "",
        dateOfBirth: "",
      });

      navigate("/", { replace: true });

    } catch {
      showSnackbar("Invalid or expired verification code", "error");
      setStatus("idle");
      setOtp("");
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
                type="tel"
                inputProps={{ maxLength: 10 }}
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
                  disabled={isDevOtp}
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

            {/* ACTION BUTTON */}
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

          {/* Doctor Login */}
          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" align="center" color="text.secondary">
            Are you a doctor?
          </Typography>

          <Box textAlign="center" mt={1}>
            <Link
              component={RouterLink}
              to="/doctor/login"
              underline="hover"
              sx={{ fontWeight: 600 }}
            >
              Login as a Doctor
            </Link>
          </Box>

        </CardContent>
      </Card>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={(event, reason) => {
          if (reason === "clickaway") return;
          setSnackbar({ ...snackbar, open: false });
        }}
        sx={{ zIndex: 2000 }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2, boxShadow: 6, width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

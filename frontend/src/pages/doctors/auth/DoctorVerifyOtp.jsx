import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import axios from "../../../api/api";

export default function DoctorVerifyOtp() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");

  // 🔐 Safety: redirect if email missing
  useEffect(() => {
    if (!state?.email) {
      navigate("/doctor/login", { replace: true });
    }
  }, [state, navigate]);

  const handleVerify = async () => {
    try {
      const res = await axios.post("/api/doctor/verify-otp", {
        email: state.email,
        otp
      });

      if (res.data.action === "LOGIN") {
        localStorage.setItem("doctorEmail", state.email);
        navigate("/doctor/dashboard");
      }

      if (res.data.action === "REGISTER") {
        navigate("/doctor/register", { state: { email: state.email } });
      }

      if (res.data.action === "PENDING") {
        alert("Your account is under verification.");
      }
    } catch (err) {
      alert("Invalid or expired OTP");
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h5" gutterBottom>
          Verify OTP
        </Typography>

        <TextField
          fullWidth
          label="OTP"
          margin="normal"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <Button fullWidth variant="contained" onClick={handleVerify}>
          Verify & Continue
        </Button>
      </Box>
    </Container>
  );
}

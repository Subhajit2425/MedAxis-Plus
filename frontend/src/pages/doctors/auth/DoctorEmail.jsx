import { useState } from "react";
import { Container, TextField, Button, Typography, Box } from "@mui/material";
import axios from "../../../api/api";
import api from "../../../api/api";

import { useNavigate } from "react-router-dom";

export default function DoctorEmail() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!email) return alert("Enter email");

    await api.post("/api/doctor/send-otp", { email });
    navigate("/doctor/verify", { state: { email } });
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h5" gutterBottom>
          Doctor Login
        </Typography>

        <TextField
          fullWidth
          label="Professional Email"
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button fullWidth variant="contained" onClick={handleSendOtp}>
          Send Verification Code
        </Button>
      </Box>
    </Container>
  );
}

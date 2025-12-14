import React, { useState, useEffect } from "react";
import axios from "axios";
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

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    email: "",
    dateOfBirth: "",
  });

  const [status, setStatus] = useState("idle"); // idle | loading | error

  // 🔥 If already logged in, redirect to home
  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");
    if (userEmail) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      await axios.post("http://localhost:5000/api/register-user", formData);

      // ✅ Save login state
      localStorage.setItem("userEmail", formData.email);

      // ✅ Redirect to home (NO reload)
      navigate("/", { replace: true });

    } catch (error) {
      // Email already exists → treat as login
      if (error.response && error.response.status === 409) {
        localStorage.setItem("userEmail", formData.email);
        navigate("/", { replace: true });
      } else {
        setStatus("error");
      }
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Card elevation={4}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Login / Register
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
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <CircularProgress size={24} />
              ) : (
                "Login / Register"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}

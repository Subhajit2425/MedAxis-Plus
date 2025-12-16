import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
  Box,
  Alert,
  Divider,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";

export default function Contact() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!userEmail) {
      navigate("/login", { replace: true });
    }
  }, [userEmail, navigate]);

  // ⛔ Prevent rendering while redirecting
  if (!userEmail) return null;


  const [status, setStatus] = useState("idle"); // idle | success | error

  if (!userEmail) {
    navigate("/login");
    return null;
  }

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/api/feedback", {
        name: formData.name,
        email: userEmail,
        subject: formData.subject,
        message: formData.message,
      });

      setStatus("success");

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      setStatus("error");
    }
  };


  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 8 }}>
      {/* HEADER */}
      <Box textAlign="center" mb={5}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Contact <span style={{ color: "#1976d2" }}>MedAxis+</span>
        </Typography>
        <Typography color="text.secondary" maxWidth="600px" mx="auto">
          We’re here to help you with appointments, accounts, and healthcare
          support. Reach out anytime.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* LEFT: CONTACT INFO */}
        <Grid item xs={12} md={4}>
          <Card elevation={3} sx={{ borderRadius: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Get in Touch
              </Typography>

              <Divider sx={{ mb: 2 }} />

              <Box display="flex" alignItems="center" mb={2}>
                <EmailIcon color="primary" sx={{ mr: 1 }} />
                <Typography>support@medaxis.com</Typography>
              </Box>

              <Box display="flex" alignItems="center" mb={2}>
                <PhoneIcon color="primary" sx={{ mr: 1 }} />
                <Typography>+91 XXXXX XXXXX</Typography>
              </Box>

              <Box display="flex" alignItems="center" mb={3}>
                <LocationOnIcon color="primary" sx={{ mr: 1 }} />
                <Typography>India</Typography>
              </Box>

              <Typography variant="body2" color="text.secondary">
                Our support team typically responds within 24 hours.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT: CONTACT FORM */}
        <Grid item xs={12} md={8}>
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Send Us a Message
              </Typography>

              <Divider sx={{ mb: 3 }} />

              {status === "success" && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Thank you for contacting MedAxis+. We’ll get back to you
                  shortly.
                </Alert>
              )}

              {status === "error" && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  Something went wrong. Please try again later.
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Full Name"
                      name="name"
                      fullWidth
                      required
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Email Address"
                      name="email"
                      type="email"
                      fullWidth
                      required
                      value={userEmail}
                      disabled
                      helperText="This is the email linked to your MedAxis+ account"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Subject"
                      name="subject"
                      select
                      fullWidth
                      required
                      value={formData.subject}
                      onChange={handleChange}
                    >
                      <MenuItem value="Appointment Issue">
                        Appointment Issue
                      </MenuItem>
                      <MenuItem value="Account / Login Problem">
                        Account / Login Problem
                      </MenuItem>
                      <MenuItem value="Doctor Information">
                        Doctor Information
                      </MenuItem>
                      <MenuItem value="Feedback / Suggestion">
                        Feedback / Suggestion
                      </MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Message"
                      name="message"
                      multiline
                      rows={4}
                      fullWidth
                      required
                      value={formData.message}
                      onChange={handleChange}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      sx={{
                        mt: 1,
                        px: 5,
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: 2,
                      }}
                    >
                      Send Message
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* FOOTER NOTE */}
      <Box textAlign="center" mt={6}>
        <Typography variant="body2" color="text.secondary">
          Your health matters. MedAxis+ is committed to secure and reliable
          healthcare access.
        </Typography>
      </Box>
    </Container>
  );
}

import React from "react";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent
} from "@mui/material";

import {
  LocalHospital,
  Verified,
  LocationOn,
  EventAvailable
} from "@mui/icons-material";

export default function About() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Hero Section */}
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          About <span style={{ color: "#1976d2" }}>MedAxis+</span>
        </Typography>
        <Typography variant="h6" color="text.secondary">
          A premium digital healthcare platform built for trust, speed, and
          simplicity.
        </Typography>
      </Box>

      {/* Intro Section */}
      <Box mb={6}>
        <Typography variant="body1" fontSize="1.1rem" lineHeight={1.8}>
          <strong>MedAxis+</strong> is a modern, patient‑first healthcare platform
          designed to simplify how people discover doctors and book
          appointments. We bridge the gap between patients and verified medical
          professionals by combining clean design, reliable data, and smart
          technology.
        </Typography>
      </Box>

      {/* Vision & Mission */}
      <Grid container spacing={4} mb={6}>
        <Grid item xs={12} md={6}>
          <Card elevation={4} sx={{ height: "100%", borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Our Vision
              </Typography>
              <Typography color="text.secondary" lineHeight={1.7}>
                To redefine healthcare accessibility by creating a transparent,
                technology‑driven ecosystem where patients connect with the
                right doctors confidently and effortlessly.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={4} sx={{ height: "100%", borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Our Mission
              </Typography>
              <Typography color="text.secondary" lineHeight={1.7}>
                To simplify doctor discovery, ensure transparency in medical
                services, and empower patients to make informed healthcare
                decisions—while giving doctors a professional digital presence.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Features Section */}
      <Box mb={6}>
        <Typography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          gutterBottom
        >
          Why Choose MedAxis+
        </Typography>

        <Grid container spacing={4} mt={2}>
          <Grid item xs={12} md={3}>
            <Card elevation={3} sx={{ textAlign: "center", p: 3, borderRadius: 3 }}>
              <LocalHospital fontSize="large" color="primary" />
              <Typography fontWeight="bold" mt={2}>
                Smart Discovery
              </Typography>
              <Typography color="text.secondary" fontSize="0.95rem">
                Find doctors by specialization, experience, and location.
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card elevation={3} sx={{ textAlign: "center", p: 3, borderRadius: 3 }}>
              <Verified fontSize="large" color="primary" />
              <Typography fontWeight="bold" mt={2}>
                Verified Profiles
              </Typography>
              <Typography color="text.secondary" fontSize="0.95rem">
                Trusted and authentic medical professionals only.
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card elevation={3} sx={{ textAlign: "center", p: 3, borderRadius: 3 }}>
              <LocationOn fontSize="large" color="primary" />
              <Typography fontWeight="bold" mt={2}>
                Location Based Care
              </Typography>
              <Typography color="text.secondary" fontSize="0.95rem">
                Integrated maps to locate nearby clinics easily.
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card elevation={3} sx={{ textAlign: "center", p: 3, borderRadius: 3 }}>
              <EventAvailable fontSize="large" color="primary" />
              <Typography fontWeight="bold" mt={2}>
                Easy Appointments
              </Typography>
              <Typography color="text.secondary" fontSize="0.95rem">
                Book appointments in just a few clicks.
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Closing Section */}
      <Box textAlign="center" mt={8}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          MedAxis+ — Where Healthcare Meets Clarity
        </Typography>
        <Typography color="text.secondary" maxWidth="700px" mx="auto">
          We believe healthcare should be accessible, transparent, and
          stress‑free. MedAxis+ is built to support smarter decisions, better
          connections, and healthier lives.
        </Typography>
      </Box>
    </Container>
  );
}
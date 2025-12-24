import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../../api/api";

import {
  Container,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Grid,
  Avatar,
  Box,
  Button,
  CardActionArea,
  CardActions,
  TextField,
  InputAdornment,
  Alert,
  Paper,
  Divider
} from "@mui/material";

import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import SearchIcon from "@mui/icons-material/Search";

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const search = searchParams.get("search") || "";
  const specialization = searchParams.get("specialization") || "";
  const [searchTerm, setSearchTerm] = useState(search || specialization);

  useEffect(() => {
    setSearchTerm(search || specialization);
  }, [search, specialization]);

  useEffect(() => {
    api
      .get(`/api/doctors`)
      .then((response) => {
        setDoctors(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load doctors.");
        setLoading(false);
      });
  }, []);

  const filteredDoctors = doctors.filter((doc) => {
    const q = searchTerm.toLowerCase();
    if (!q) return true;

    return (
      doc.name.toLowerCase().includes(q) ||
      doc.specialization.toLowerCase().includes(q) ||
      doc.address.toLowerCase().includes(q)
    );
  });

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 10 }}>
        <CircularProgress />
        <Typography mt={2}>Loading doctors…</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 5 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, pb: 6 }}>
      {/* ================= HEADER ================= */}
      <Typography
        variant="h4"
        fontWeight={700}
        textAlign="center"
        mb={1}
      >
        Find & Book Trusted Doctors
      </Typography>

      <Typography
        variant="body1"
        textAlign="center"
        color="text.secondary"
        mb={4}
      >
        Search by name, specialization, or location
      </Typography>

      {/* ================= SEARCH ================= */}
      <Paper
        elevation={2}
        sx={{
          p: 2.5,
          mb: 4,
          borderRadius: 3,
          maxWidth: 720,
          mx: "auto"
        }}
      >
        <TextField
          fullWidth
          placeholder="Search doctors, specialization, location…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="primary" />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* ================= CARDS ================= */}
      <Grid container spacing={3}>
        {filteredDoctors.map((doc) => (
          <Grid
            item
            key={doc.id}
            xs={12}          // ✅ FULL WIDTH ON MOBILE
            sm={6}
            md={4}
          >
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 4,
                border: "1px solid #e5e7eb",
                transition: "all 0.25s ease",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: "0 20px 40px rgba(15,23,42,0.12)",
                },
              }}
            >
              <CardActionArea
                onClick={() => navigate(`/doctors/${doc.id}`)}
                sx={{ p: 2 }}
              >
                <Box display="flex" gap={2} alignItems="center" mb={2}>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: "primary.main",
                      boxShadow: 3,
                    }}
                  >
                    <LocalHospitalIcon sx={{ fontSize: 32 }} />
                  </Avatar>

                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {doc.name}
                    </Typography>
                    <Typography variant="body2" color="primary">
                      {doc.specialization}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 1.5 }} />

                <Typography variant="body2" color="text.secondary">
                  Experience: <b>{doc.experience} years</b>
                </Typography>

                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  Consultation Fees: <b>₹{doc.fees}</b>
                </Typography>

                <Box display="flex" alignItems="center" mt={1}>
                  <LocationOnIcon sx={{ fontSize: 18, color: "gray" }} />
                  <Typography
                    variant="body2"
                    ml={0.5}
                    color="text.secondary"
                    noWrap
                  >
                    {doc.address}
                  </Typography>
                </Box>
              </CardActionArea>

              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 999,
                  }}
                  onClick={() => {
                    if (localStorage.getItem("userEmail")) {
                      navigate(
                        `/doctors/book-slot?doctorId=${doc.id}&doctorName=${encodeURIComponent(
                          doc.name
                        )}`
                      );
                    } else {
                      navigate("/login", {
                        state: {
                          snackbar: {
                            message: "Please login to book an appointment.",
                            severity: "warning",
                          },
                        },
                      });
                    }
                  }}
                >
                  Book Appointment
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredDoctors.length === 0 && (
        <Typography
          variant="h6"
          textAlign="center"
          color="text.secondary"
          mt={6}
        >
          No doctors found for “{searchTerm}”
        </Typography>
      )}
    </Container>
  );
}

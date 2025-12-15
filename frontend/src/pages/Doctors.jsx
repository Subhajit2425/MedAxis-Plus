import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

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
  Paper
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

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("specialization") || ""
  );

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
    return (
      doc.name.toLowerCase().includes(q) ||
      doc.specialization.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 10 }}>
        <CircularProgress />
        <Typography mt={2}>Loading Doctors...</Typography>
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
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* PAGE TITLE */}
      <Typography
        variant="h4"
        fontWeight={700}
        textAlign="center"
        mb={4}
        sx={{ letterSpacing: "0.5px" }}
      >
        Find Your Doctor
      </Typography>

      {/* SEARCH BAR */}
      <Paper elevation={3} sx={{ p: 2, mb: 4, borderRadius: 3 }}>
        <TextField
          label="Search by Name or Specialization"
          variant="outlined"
          fullWidth
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

      {/* DOCTOR CARDS */}
      <Grid container spacing={3}>
        {filteredDoctors.map((doc) => (
          <Grid item xs={12} sm={6} md={4} key={doc.id}>
            <Card
              elevation={4}
              sx={{
                height: "100%",
                borderRadius: 3,
                transition: "0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: 6,
                },
              }}
            >
              <CardActionArea
                onClick={() => navigate(`/doctor/${doc.id}`)} // ← Open Doctor Details Page
              >
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar
                      sx={{
                        bgcolor: "#1976d2",
                        width: 60,
                        height: 60,
                        boxShadow: 2,
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

                  <Typography variant="body2" color="text.secondary">
                    Experience: <b>{doc.experience}</b>
                  </Typography>

                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    Fees: <b>₹{doc.fees}</b>
                  </Typography>

                  <Box display="flex" alignItems="center" mt={1}>
                    <LocationOnIcon sx={{ fontSize: 18, color: "gray" }} />
                    <Typography variant="body2" ml={0.5} color="text.secondary">
                      {doc.address}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>

              <CardActions sx={{ p: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                  onClick={() => {
                    if (localStorage.getItem("userEmail")) {
                      navigate(
                        `/book-appointment?doctorId=${doc.id}&doctorName=${encodeURIComponent(
                          doc.name
                        )}`
                      );
                    } else {
                      navigate("/login");
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
          mt={5}
        >
          No doctors found matching "{searchTerm}"
        </Typography>
      )}
    </Container>
  );
}

import React, { useEffect, useState } from "react";
import api from "../api";
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  IconButton,
  Box,
  Chip
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";

export default function Appointment() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    const userEmail = localStorage.getItem("userEmail");

    api
      .delete(`/api/appointments/${id}`, {
        params: { email: userEmail }
      })
      .then(() => {
        setAppointments((prev) => prev.filter((item) => item.id !== id));
      })
      .catch(() => {
        alert("Failed to cancel appointment");
      });
  };

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
      setError("You must be logged in to view appointments.");
      setLoading(false);
      return;
    }

    api
      .get(`/api/appointments`, {
        params: { email: userEmail }
      })
      .then((response) => {
        setAppointments(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load appointments.");
        setLoading(false);
      });
  }, []);

  /* -------------------- STATES -------------------- */

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 8 }}>
        <CircularProgress size={40} />
        <Typography sx={{ mt: 2 }} color="text.secondary">
          Fetching your appointments…
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 6 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (appointments.length === 0) {
    return (
      <Container sx={{ mt: 6 }}>
        <Card elevation={3} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="h5" fontWeight={600}>
              No Appointments Found
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              You haven’t booked any appointments yet.
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  /* -------------------- UI -------------------- */

  return (
    <Container sx={{ mt: 6, mb: 6 }}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700}>
          My Appointments
        </Typography>
        <Typography color="text.secondary">
          Manage your scheduled doctor visits
        </Typography>
      </Box>

      <TableContainer
        component={Paper}
        elevation={4}
        sx={{ borderRadius: 3, overflow: "hidden" }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f7fb" }}>
              <TableCell><b>Doctor</b></TableCell>
              <TableCell><b>Patient</b></TableCell>
              <TableCell><b>Mobile</b></TableCell>
              <TableCell><b>Email</b></TableCell>
              <TableCell><b>Date</b></TableCell>
              <TableCell align="center"><b>Action</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {appointments.map((appt) => (
              <TableRow
                key={appt.id}
                hover
                sx={{ "&:last-child td": { borderBottom: 0 } }}
              >
                <TableCell>
                  <Typography fontWeight={600}>
                    {appt.doctor_name}
                  </Typography>
                </TableCell>

                <TableCell>
                  {appt.first_name} {appt.last_name}
                </TableCell>

                <TableCell>{appt.mobile_number}</TableCell>

                <TableCell>
                  <Chip
                    label={appt.email}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>

                <TableCell>
                  {new Date(appt.created_at).toLocaleDateString()}
                </TableCell>

                <TableCell align="center">
                  <IconButton
                    onClick={() => handleDelete(appt.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

        </Table>
      </TableContainer>
    </Container>
  );
}

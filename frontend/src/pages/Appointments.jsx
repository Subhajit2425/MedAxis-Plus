import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Typography, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Card, CardContent } from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";

export default function Appointment() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) {
      return;
    }

    const userEmail = localStorage.getItem("userEmail");

    axios
      .delete(`${import.meta.env.VITE_API_URL}/api/appointments/${id}`, {
        params: { email: userEmail }
      })
      .then(() => {
        setAppointments((prev) => prev.filter((item) => item.id !== id));
      })
      .catch((err) => {
        console.error("Delete error:", err);
        alert("Failed to delete appointment");
      });
  };


  useEffect(() => {
  const userEmail = localStorage.getItem("userEmail");

  console.log("👤 Logged in email:", userEmail);

  if (!userEmail) {
    setError("User not logged in.");
    setLoading(false);
    return;
  }

  axios
    .get(`${import.meta.env.VITE_API_URL}/api/appointments`, {
      params: { email: userEmail }
    })
    .then((response) => {
      setAppointments(response.data);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Error fetching appointments:", err);
      setError("Unable to load appointments.");
      setLoading(false);
    });
}, []);



  if (loading) {
    return (
      <Container style={{ textAlign: 'center', marginTop: '50px' }}>
        <CircularProgress />
        <Typography>Loading Appointments...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container style={{ marginTop: '50px' }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (appointments.length === 0) {
    return (
      <Container style={{ marginTop: '50px' }}>
        <Card>
          <CardContent>
            <Typography variant="h5" component="h1" gutterBottom>
              Your Appointments
            </Typography>
            <Alert severity="info">You have no upcoming appointments booked.</Alert>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container style={{ marginTop: "40px" }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Your Appointments
      </Typography>

      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Doctor Name</TableCell>
              <TableCell>Patient Name</TableCell>
              <TableCell>Mobile Number</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Booking Date</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {appointments.map((appt) => (
              <TableRow key={appt.id}>
                <TableCell>{appt.doctor_name}</TableCell>
                <TableCell>{`${appt.first_name} ${appt.last_name}`}</TableCell>
                <TableCell>{appt.mobile_number}</TableCell>
                <TableCell>{appt.email}</TableCell>
                <TableCell>{new Date(appt.created_at).toLocaleDateString()}</TableCell>

                <TableCell>
                  <IconButton
                    onClick={() => handleDelete(appt.id)}
                    style={{ color: "red" }}
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

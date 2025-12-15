import React, { useState, useEffect } from 'react';
import api from "../api";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Alert, CircularProgress } from '@mui/material';

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const doctorId = searchParams.get('doctorId');
  const doctorName = searchParams.get('doctorName') || 'Selected Doctor';

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobileNumber: localStorage.getItem("userMobile") || '',
    email: localStorage.getItem("userEmail") || '',
    doctorId: doctorId,
  });

  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'

  useEffect(() => {
    if (!doctorId) {
      // Redirect if no doctor ID is provided in the URL
      navigate('/doctors');
    }
  }, [doctorId, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    try {
      // Send the data to your back-end API endpoint
      const response = await api.post(
        `/api/appointments`,
        formData
      );

      console.log('Appointment booked:', response.data);
      setStatus('success');

      // Optionally redirect the user after success
      setTimeout(() => navigate('/appointments'), 1500); 

    } catch (error) {
      console.error('Error booking appointment:', error);
      setStatus('error');
    }
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: "40px" }}>
      <Card elevation={4}>
        <CardContent>
          <Typography variant="h5" component="h1" gutterBottom>
            Book an Appointment
          </Typography>
          <Typography variant="h6" color="primary" gutterBottom>
            {`With ${doctorName}`}
          </Typography>

          {status === 'success' && <Alert severity="success">Appointment successfully booked!</Alert>}
          {status === 'error' && <Alert severity="error">Failed to book appointment. Please try again.</Alert>}

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
                type="tel"
                value={formData.mobileNumber}
                disabled
              />
            </Box>
            <Box mb={2}>
              <TextField
                label="Email"
                name="email"
                fullWidth
                required
                type="email"
                value={formData.email}
                disabled
              />
            </Box>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={status === 'loading'}
            >
              {status === 'loading' ? <CircularProgress size={24} /> : 'Book Appointment'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}


import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  IconButton,
  Box,
  Chip,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function Appointment() {
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    if (!userEmail) {
      navigate("/login", { replace: true });
      return;
    }

    api
      .get("/api/appointments", { params: { email: userEmail } })
      .then((res) => {
        setAppointments(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load appointments.");
        setLoading(false);
      });
  }, [navigate, userEmail]);

  const handleCancelClick = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmCancel = async () => {
    setDeleting(true);
    try {
      await api.put(`/api/appointments/${deleteId}/cancel`, {
        params: { email: userEmail },
      });

      setAppointments((prev) =>
        prev.map((a) =>
          a.id === deleteId ? { ...a, status: "cancelled" } : a
        )
      );

      showSnackbar("Appointment cancelled successfully");
    } catch {
      showSnackbar("Failed to cancel appointment", "error");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  /* -------------------- STATES -------------------- */

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", mt: 8 }}>
        <CircularProgress />
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          Loading appointments…
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
        <Card sx={{ borderRadius: 3, textAlign: "center", py: 6 }}>
          <Typography variant="h5" fontWeight={600}>
            No Appointments
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            You don’t have any scheduled appointments.
          </Typography>
        </Card>
      </Container>
    );
  }

  /* -------------------- UI -------------------- */

  return (
    <Container sx={{ mt: 6, mb: 6 }}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight={700}>
          My Appointments
        </Typography>
        <Typography color="text.secondary">
          View and manage your upcoming visits
        </Typography>
      </Box>

      <Stack spacing={2}>
        {appointments.map((appt) => (
          <Card
            key={appt.id}
            elevation={3}
            sx={{
              borderRadius: 3,
              transition: "0.2s",
              "&:hover": { boxShadow: 6 },
            }}
          >
            <CardContent>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ sm: "center" }}
                justifyContent="space-between"
                spacing={2}
              >
                {/* LEFT */}
                <Box>
                  <Typography fontWeight={600} fontSize={18}>
                    {appt.doctor_name}
                  </Typography>

                  <Typography color="text.secondary" fontSize={14}>
                    {new Date(appt.appointment_date).toLocaleDateString(undefined, {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </Typography>
                </Box>

                {/* RIGHT */}
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Chip
                    label={appt.status.toUpperCase()}
                    sx={{
                      fontWeight: 600,
                      color: "#fff",
                      backgroundColor:
                        appt.status === "pending"
                          ? "#f59e0b"
                          : appt.status === "approved"
                          ? "#16a34a"
                          : "#dc2626",
                    }}
                  />

                  {appt.status === "pending" && (
                    <IconButton
                      color="error"
                      onClick={() => handleCancelClick(appt.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onClose={() => !deleting && setConfirmOpen(false)}>
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this appointment?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>No</Button>
          <Button color="error" variant="contained" onClick={confirmCancel}>
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

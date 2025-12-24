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

  const [filter, setFilter] = useState("all");
  const filteredAppointments =
    filter === "all"
      ? appointments
      : appointments.filter(
        (appt) => appt.status.toLowerCase() === filter
      );

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    if (!userEmail) {
      navigate("/login", {
        replace: true,
        state: {
          snackbar: {
            message: "Please login to manage the appointments.",
            severity: "warning"
          }
        }
      });
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
      await api.put(
        `/api/appointments/${deleteId}/cancel`,
        null,
        {
          params: { email: userEmail },
        }
      );


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


      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          flexWrap: "wrap",
          mb: 4,
        }}
      >
        {[
          { label: "All", value: "all" },
          { label: "Approved", value: "approved" },
          { label: "Pending", value: "pending" },
          { label: "Rejected", value: "rejected" },
          { label: "Cancelled", value: "cancelled" },
        ].map((btn) => (
          <Button
            key={btn.value}
            variant={filter === btn.value ? "contained" : "outlined"}
            onClick={() => setFilter(btn.value)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 999,
              px: 3,
              backgroundColor:
                filter === btn.value ? "#0ea5e9" : "transparent",
              color: filter === btn.value ? "#fff" : "text.primary",
              "&:hover": {
                backgroundColor:
                  filter === btn.value ? "#0284c7" : "#e5f3fb",
              },
            }}
          >
            {btn.label}
          </Button>
        ))}
      </Box>


      <Stack spacing={2}>
        {/* EMPTY STATE FOR FILTER */}
        {filteredAppointments.length === 0 && (
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              py: 6,
              textAlign: "center",
              backgroundColor: "#f8fafc",
              border: "1px dashed #cbd5e1",
            }}
          >
            <Typography fontWeight={600}>
              No{" "}
              {filter !== "all"
                ? filter.charAt(0).toUpperCase() + filter.slice(1)
                : ""}{" "}
              appointments found
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Try switching to a different filter
            </Typography>
          </Card>
        )}

        {/* APPOINTMENT CARDS */}
        {filteredAppointments.map((appt) => (
          <Card
            key={appt.id}
            elevation={3}
            onClick={() => navigate(`/appointments/${appt.id}`)}
            sx={{
              borderRadius: 3,
              cursor: "pointer",
              transition: "0.2s",
              "&:hover": {
                boxShadow: 6,
                backgroundColor: "#f8fafc",
              },
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
                          ? "#f59e0b"   // yellow
                          : appt.status === "approved"
                            ? "#16a34a" // green
                            : appt.status === "cancelled"
                              ? "#64748b" // gray
                              : "#dc2626" // rejected (red)
                    }}
                  />

                  {appt.status === "pending" && (
                    <IconButton
                      color="error"
                      disabled={confirmOpen}
                      onClick={(e) => {
                        e.stopPropagation(); // 🔥 prevent card click
                        handleCancelClick(appt.id);
                      }}
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

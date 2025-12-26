import React, { useEffect, useState } from "react";
import api from "../../api/api";
import {
  Container,
  Card,
  Typography,
  TextField,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Button,
  Divider,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Avatar,
  Grid,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail");

  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [status, setStatus] = useState("loading");
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  useEffect(() => {
    if (!email) {
      navigate("/login");
      return;
    }

    api
      .get(`/api/user/${encodeURIComponent(email)}`)
      .then((res) => {
        setUser({
          firstName: res.data.first_name,
          lastName: res.data.last_name,
          mobileNumber: res.data.mobile_number,
          email: res.data.email,
          dateOfBirth: res.data.date_of_birth.split("T")[0],
          createdAt: res.data.registration_date.split("T")[0],
        });
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, [email, navigate]);

  const handleChange = (e) =>
    setUser({ ...user, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/api/user/${encodeURIComponent(email)}`, {
        firstName: user.firstName.trim(),
        lastName: user.lastName.trim(),
        mobileNumber: user.mobileNumber.trim(),
        dateOfBirth: user.dateOfBirth,
      });
      setEditMode(false);
      showSnackbar("Profile updated successfully");
    } catch {
      showSnackbar("Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const confirmLogout = () => {
    localStorage.clear();
    navigate("/", { replace: true });
  };

  if (status === "loading") {
    return (
      <Container sx={{ mt: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography mt={2} color="text.secondary">
          Loading your profile…
        </Typography>
      </Container>
    );
  }

  if (status === "error") {
    return (
      <Container sx={{ mt: 6 }}>
        <Alert severity="error">Unable to load profile.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 7 }}>
      <Card
        elevation={10}
        sx={{
          borderRadius: 5,
          overflow: "hidden",
          background:
            "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        }}
      >
        {/* TOP SECTION */}
        <Box
          sx={{
            px: 4,
            pt: 4,
            pb: 3,
            background:
              "linear-gradient(135deg, #0f172a, #1e293b)",
            color: "#fff",
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                width: 68,
                height: 68,
                bgcolor: "#38bdf8",
                color: "#0f172a",
                fontWeight: 700,
              }}
            >
              {user.firstName[0]}
            </Avatar>

            <Box flex={1}>
              <Typography fontSize={20} fontWeight={700}>
                {user.firstName} {user.lastName}
              </Typography>
              <Typography fontSize={13} sx={{ opacity: 0.85 }}>
                {user.email}
              </Typography>
            </Box>

            <IconButton
              onClick={() => setEditMode(!editMode)}
              sx={{ color: "#e5e7eb" }}
            >
              <EditIcon />
            </IconButton>
          </Box>

          <Box mt={2}>
            <Chip
              icon={<CalendarMonthIcon />}
              label={`Member since ${user.createdAt}`}
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.15)",
                color: "#e5e7eb",
                fontWeight: 500,
              }}
            />
          </Box>
        </Box>

        {/* CONTENT */}
        <Box sx={{ p: 4 }}>
          <Typography
            fontWeight={700}
            fontSize={14}
            letterSpacing={1}
            color="text.secondary"
            mb={2}
          >
            PERSONAL INFORMATION
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name"
                name="firstName"
                value={user.firstName}
                onChange={handleChange}
                fullWidth
                disabled={!editMode}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name"
                name="lastName"
                value={user.lastName}
                onChange={handleChange}
                fullWidth
                disabled={!editMode}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Mobile Number"
                name="mobileNumber"
                value={user.mobileNumber}
                onChange={handleChange}
                fullWidth
                disabled={!editMode}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField label="Email" value={user.email} fullWidth disabled />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Date of Birth"
                type="date"
                name="dateOfBirth"
                value={user.dateOfBirth}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                disabled={!editMode}
              />
            </Grid>
          </Grid>

          {editMode && (
            <Button
              variant="contained"
              fullWidth
              sx={{
                mt: 4,
                py: 1.3,
                borderRadius: 2.5,
                fontWeight: 600,
              }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <CircularProgress size={22} /> : "Save Changes"}
            </Button>
          )}

          <Divider sx={{ my: 4 }} />

          <Button
            variant="outlined"
            color="error"
            fullWidth
            startIcon={<LogoutIcon />}
            sx={{ borderRadius: 2.5 }}
            onClick={() => setConfirmOpen(true)}
          >
            Logout
          </Button>
        </Box>
      </Card>

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert variant="filled" severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* LOGOUT CONFIRM */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You will be logged out of your account.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmLogout}>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

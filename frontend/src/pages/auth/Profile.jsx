import React, { useEffect, useState } from "react";
import api from "../../api/api";
import {
  Container,
  Card,
  CardContent,
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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
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

  /* ================= FETCH PROFILE ================= */

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
          createdAt: res.data.registration_date.split("T")[0], // ✅ registration date
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

  /* ================= STATES ================= */

  if (status === "loading") {
    return (
      <Container sx={{ mt: 6, textAlign: "center" }}>
        <CircularProgress />
        <Typography mt={2}>Loading profile…</Typography>
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

  /* ================= UI ================= */

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Card elevation={8} sx={{ borderRadius: 4 }}>
        <CardContent sx={{ p: 4 }}>
          {/* HEADER */}
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: "primary.main",
                boxShadow: 3,
              }}
            >
              <AccountCircleIcon sx={{ fontSize: 40 }} />
            </Avatar>

            <Box flex={1}>
              <Typography variant="h6" fontWeight={700}>
                {user.firstName} {user.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>

            <IconButton onClick={() => setEditMode(!editMode)}>
              <EditIcon />
            </IconButton>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* DETAILS */}
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

            <Grid item xs={12} sm={6}>
              <TextField
                label="Date of Birth"
                name="dateOfBirth"
                type="date"
                value={user.dateOfBirth}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
                disabled={!editMode}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Registered On"
                value={user.createdAt}
                fullWidth
                disabled
              />
            </Grid>
          </Grid>

          {/* SAVE */}
          {editMode && (
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 4, borderRadius: 2 }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <CircularProgress size={22} /> : "Save Changes"}
            </Button>
          )}

          {/* LOGOUT */}
          <Button
            variant="outlined"
            color="error"
            fullWidth
            sx={{ mt: 3, borderRadius: 2 }}
            startIcon={<LogoutIcon />}
            onClick={() => setConfirmOpen(true)}
          >
            Logout
          </Button>
        </CardContent>
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

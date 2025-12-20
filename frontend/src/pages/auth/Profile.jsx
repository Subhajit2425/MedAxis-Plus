import React, { useEffect, useState } from "react"
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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();

  const email = localStorage.getItem("userEmail");
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [saving, setSaving] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" // success | error | warning | info
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };


  const [confirmOpen, setConfirmOpen] = useState(false);
  const handleLogoutClick = () => {
    setConfirmOpen(true);
  };

  const confirmLogout = async () => {
    try {
      localStorage.clear();
      navigate("/");
    } finally {
      setConfirmOpen(false);
    }
  };


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
        });
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, [email, navigate]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      await api.put(
        `/api/user/${encodeURIComponent(email)}`,
        {
          firstName: user.firstName.trim(),
          lastName: user.lastName.trim(),
          mobileNumber: user.mobileNumber.trim(),
          dateOfBirth: user.dateOfBirth
        }
      );

      setEditMode(false);
      showSnackbar("Profile updated successfully", "success");
    } catch (err) {
      console.error(err);
      showSnackbar("Failed to update profile. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };


  if (status === "loading") {
    return (
      <Container sx={{ mt: 6, textAlign: "center" }}>
        <CircularProgress />
        <Typography mt={2}>Loading Profile...</Typography>
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
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Card elevation={6} sx={{ borderRadius: 3 }}>
        <CardContent>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" fontWeight="bold">
                My Profile
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your personal details
              </Typography>
            </Box>

            <IconButton onClick={() => setEditMode(!editMode)}>
              <EditIcon />
            </IconButton>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Profile Fields */}
          <TextField
            label="First Name"
            name="firstName"
            value={user.firstName}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled={!editMode}
          />

          <TextField
            label="Last Name"
            name="lastName"
            value={user.lastName}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled={!editMode}
          />

          <TextField
            label="Mobile Number"
            name="mobileNumber"
            value={user.mobileNumber}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled={!editMode}
          />

          <TextField
            label="Email"
            value={user.email}
            fullWidth
            margin="normal"
            disabled
          />

          <TextField
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            value={user.dateOfBirth}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            disabled={!editMode}
          />

          {/* Actions */}
          {editMode && (
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}

              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <CircularProgress size={22} /> : "Save"}
            </Button>
          )}

          <Button
            variant="outlined"
            color="error"
            fullWidth
            sx={{ mt: 2 }}
            startIcon={<LogoutIcon />}
            onClick={handleLogoutClick}
          >
            Logout
          </Button>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }} // 🔥 TOP is key
        onClose={(event, reason) => {
          if (reason === "clickaway") return;
          setSnackbar({ ...snackbar, open: false });
        }}
        sx={{ zIndex: 2000 }} // 🔥 FORCE visibility
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          sx={{
            borderRadius: 2,
            boxShadow: 6,
            width: "100%"
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>


      <Dialog open={confirmOpen} onClose={() => !saving && setConfirmOpen(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>

        <DialogContent>
          <DialogContentText>
            You will be logged out of your account. Do you want to continue?
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>

          <Button color="error" variant="contained" onClick={confirmLogout}>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

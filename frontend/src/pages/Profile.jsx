import React, { useEffect, useState } from "react"
import api from "../api";
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
  Divider
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [saving, setSaving] = useState(false);

  const email = localStorage.getItem("userEmail");

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
          firstName: user.firstName,
          lastName: user.lastName,
          mobileNumber: user.mobileNumber,
          dateOfBirth: user.dateOfBirth
        }
      );

      setEditMode(false);
      alert("Profile updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };


  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to logout?")) return;
    localStorage.clear();
    navigate("/", { replace: true });
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
              {editMode ? <SaveIcon /> : <EditIcon />}
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
              {saving ? "Saving..." : "Save"}
            </Button>
          )}

          <Button
            variant="outlined"
            color="error"
            fullWidth
            sx={{ mt: 2 }}
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}

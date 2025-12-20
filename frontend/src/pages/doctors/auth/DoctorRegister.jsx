import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Box,
  Alert,
  Snackbar,
} from "@mui/material";
import api from "../../../api/api";

export default function DoctorRegister() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    specialization: "",
    experience: "",
    address: "",
    fees: ""
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" // success | error | warning | info
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar(prev => ({ ...prev, open: false }));
    setTimeout(() => {
      setSnackbar({ open: true, message, severity });
    }, 50);
  };


  // 🔐 Safety: block direct access
  useEffect(() => {
    if (!state?.email) {
      navigate("/doctor/login", { replace: true });
    }
  }, [state, navigate]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setError("");
    setSubmitting(true);

    try {
      await api.post("/api/doctor/register", {
        email: state.email,
        ...form
      });


      showSnackbar("Registration submitted. Your account is under verification.", "success");
      navigate("/doctor/status", { replace: true });
    } catch (err) {
      showSnackbar("Failed to submit registration. Please try again.", "success");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h5" gutterBottom>
          Doctor Registration
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Complete your profile. Our team will verify your details before approval.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {Object.keys(form).map((field) => (
          <TextField
            key={field}
            fullWidth
            margin="normal"
            name={field}
            label={field.toUpperCase()}
            value={form[field]}
            onChange={handleChange}
          />
        ))}

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          disabled={submitting}
          onClick={submit}
        >
          {submitting ? <CircularProgress size={24} /> : "Submit"}
        </Button>
      </Box>

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
    </Container>
  );
}

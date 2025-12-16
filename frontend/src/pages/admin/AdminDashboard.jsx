import { useEffect, useState } from "react";
import api from "../../api/api";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔐 Extra safety: only allow admin device
  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) {
      window.location.href = "/";
    }
  }, []);

  // 📥 Fetch pending doctor requests
  const fetchDoctors = async () => {
    try {
      const res = await api.get("/api/admin/pending-doctors");
      setDoctors(res.data);
    } catch (err) {
      setError("Failed to load doctor requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // ✅ Approve doctor
  const approveDoctor = async (id) => {
    await api.put(`/api/admin/approve-doctor/${id}`);
    setDoctors((prev) => prev.filter((doc) => doc.id !== id));
  };

  // ❌ Reject doctor
  const rejectDoctor = async (id) => {
    await api.put(`/api/admin/reject-doctor/${id}`);
    setDoctors((prev) => prev.filter((doc) => doc.id !== id));
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container sx={{ mt: 5, mb: 5 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Doctor Verification Requests
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review and approve doctors before allowing them to access the platform.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {doctors.length === 0 ? (
        <Alert severity="info">No pending doctor requests</Alert>
      ) : (
        <Grid container spacing={3}>
          {doctors.map((doc) => (
            <Grid item xs={12} md={6} lg={4} key={doc.id}>
              <Card elevation={3} sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600}>
                    {doc.name}
                  </Typography>

                  <Typography variant="body2" sx={{ mt: 1 }}>
                    📧 {doc.email}
                  </Typography>

                  <Typography variant="body2">
                    🩺 {doc.specialization}
                  </Typography>

                  <Typography variant="body2">
                    ⏳ Experience: {doc.experience}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Chip label="Pending" color="warning" />
                  </Box>

                  <Box sx={{ mt: 3, display: "flex", gap: 1 }}>
                    <Button
                      variant="contained"
                      color="success"
                      fullWidth
                      onClick={() => approveDoctor(doc.id)}
                    >
                      Approve
                    </Button>

                    <Button
                      variant="outlined"
                      color="error"
                      fullWidth
                      onClick={() => rejectDoctor(doc.id)}
                    >
                      Reject
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

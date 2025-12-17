import { Box, Card, CardContent, Typography, Button, Divider, Link } from "@mui/material";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import VerifiedIcon from "@mui/icons-material/Verified";
import ShieldIcon from "@mui/icons-material/Shield";
import { useNavigate } from "react-router-dom";

export default function DoctorLoginEntry() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 56px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f7fb, #e0f2fe)",
        px: 2
      }}
    >
      <Card
        sx={{
          maxWidth: 520,
          width: "100%",
          borderRadius: 4,
          boxShadow: "0 20px 40px rgba(0,0,0,0.08)"
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Icon */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 2
            }}
          >
            <MedicalServicesIcon sx={{ fontSize: 48, color: "#0284c7" }} />
          </Box>

          {/* Title */}
          <Typography variant="h4" align="center" fontWeight={700} gutterBottom>
            Are you a doctor?
          </Typography>

          <Typography
            align="center"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Access your professional dashboard on <b>MedAxis+</b> and manage
            appointments, patients, and availability — securely and efficiently.
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {/* Trust Points */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
              <VerifiedIcon sx={{ color: "#16a34a", mr: 1 }} />
              <Typography variant="body2">
                Only verified and licensed doctors are approved
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
              <ShieldIcon sx={{ color: "#0ea5e9", mr: 1 }} />
              <Typography variant="body2">
                Secure login with strict data protection
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <MedicalServicesIcon sx={{ color: "#0284c7", mr: 1 }} />
              <Typography variant="body2">
                Trusted by patients across multiple cities
              </Typography>
            </Box>
          </Box>

          {/* CTA Buttons */}
          <Button
            fullWidth
            size="large"
            variant="contained"
            sx={{
              py: 1.4,
              borderRadius: 2,
              fontWeight: 600,
              mb: 2
            }}
            onClick={() => navigate("/doctor/login")}
          >
            Login as a Doctor
          </Button>

          {/* Register Link */}
          <Typography align="center" variant="body2" color="text.secondary">
            New to MedAxis+?{" "}
            <Link
              component="button"
              underline="hover"
              fontWeight={600}
              onClick={() => navigate("/doctor/register")}
            >
              Register as a Doctor
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

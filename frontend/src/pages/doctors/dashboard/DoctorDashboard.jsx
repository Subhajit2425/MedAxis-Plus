import { Typography, Container } from "@mui/material";

export default function DoctorDashboard() {
  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4 }}>
        Doctor Dashboard
      </Typography>
      <Typography>
        Appointments will appear here.
      </Typography>
    </Container>
  );
}

import { Box, Typography, Button, CircularProgress } from "@mui/material";

export default function AppLoader({ status, onRetry }) {
  return (
    <Box
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{ background: "#f5f7fb" }}
    >
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
        MedAxis+
      </Typography>

      {status === "loading" && (
        <>
          <CircularProgress sx={{ mt: 3 }} />
          <Typography sx={{ mt: 2 }}>
            Connecting securely...
          </Typography>
        </>
      )}

      {status === "error" && (
        <>
          <Typography color="error" sx={{ mt: 2 }}>
            Unable to connect. Check your internet connection.
          </Typography>

          <Button variant="contained" sx={{ mt: 3 }} onClick={onRetry}>
            Retry
          </Button>
        </>
      )}
    </Box>
  );
}

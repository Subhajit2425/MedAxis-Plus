import { Box, Typography, Button, CircularProgress } from "@mui/material";

export default function AppLoader({ status, onRetry }) {
  return (
    <Box
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        background: "linear-gradient(135deg, #f8fafc, #eef2f7)",
      }}
    >
      {/* App Name */}
      <Typography
        variant="h3"
        sx={{
          fontWeight: 800,
          letterSpacing: "-0.5px",
          color: "#0f172a",
        }}
      >
        MedAxis<span style={{ color: "#2563eb" }}>+</span>
      </Typography>

      {/* Tagline */}
      <Typography
        variant="body2"
        sx={{
          mt: 1,
          color: "#475569",
          letterSpacing: "0.3px",
        }}
      >
        Smart Healthcare. Simplified.
      </Typography>

      {/* Loading */}
      {status === "loading" && (
        <>
          <CircularProgress
            size={42}
            thickness={4}
            sx={{ mt: 4, color: "#2563eb" }}
          />
          <Typography
            sx={{
              mt: 2,
              color: "#475569",
              fontSize: 14,
            }}
          >
            Establishing secure connection…
          </Typography>
        </>
      )}

      {/* Error */}
      {status === "error" && (
        <>
          <Typography
            sx={{
              mt: 3,
              color: "#b91c1c",
              fontWeight: 500,
            }}
          >
            Unable to connect to the server
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              color: "#64748b",
              fontSize: 13,
            }}
          >
            Please check your internet connection
          </Typography>

          <Button
            variant="contained"
            onClick={onRetry}
            sx={{
              mt: 3,
              px: 4,
              py: 1,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              background: "#2563eb",
              boxShadow: "0px 8px 20px rgba(37, 99, 235, 0.25)",
            }}
          >
            Retry
          </Button>
        </>
      )}

      {/* Footer */}
      <Typography
        sx={{
          position: "absolute",
          bottom: 20,
          fontSize: 12,
          color: "#94a3b8",
        }}
      >
        © {new Date().getFullYear()} MedAxis+
      </Typography>
    </Box>
  );
}

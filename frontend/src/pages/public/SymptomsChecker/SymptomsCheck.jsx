import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/api";

import {
    Container,
    Typography,
    TextField,
    Grid,
    Chip,
    Box,
    Button,
    Paper,
    CircularProgress,
    Alert
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

export default function SymptomsCheck() {
    const navigate = useNavigate();

    const [symptoms, setSymptoms] = useState([]);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // 🔹 Fetch symptoms from backend
    useEffect(() => {
        let isMounted = true;

        api
            .get("/api/symptoms")
            .then((response) => {
                if (isMounted) {
                    setSymptoms(response.data.data);
                    setLoading(false);
                }
            })
            .catch((error) => {
                if (isMounted) {
                    setError("Failed to load symptoms.");
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, []);


    const toggleSymptom = (key) => {
        setSelected((prev) => {
            if (prev.includes(key)) {
                return prev.filter((s) => s !== key);
            }
            if (prev.length >= 8) return prev; // max 8 symptoms
            return [...prev, key];
        });
    };


    const filteredSymptoms = symptoms.filter((s) =>
        s.label.toLowerCase().includes(search.trim().toLowerCase())
    );

    const handleConfirm = () => {
        navigate("/symptoms/result", {
            state: { symptoms: selected }
        });
    };

    return (
        <Container maxWidth="md" sx={{ py: 6 }}>
            {/* Header */}
            <Typography variant="h4" fontWeight={600} gutterBottom>
                AI Symptom Checker
            </Typography>
            <Typography color="text.secondary" mb={4}>
                Select one or more symptoms you are experiencing. Our AI will guide you
                to the right specialist.
            </Typography>

            {/* Loading */}
            {loading && (
                <Box textAlign="center" py={6}>
                    <CircularProgress />
                    <Typography mt={2} color="text.secondary">
                        Loading symptoms…
                    </Typography>
                </Box>
            )}

            {/* Error */}
            {error && <Alert severity="error">{error}</Alert>}

            {/* Main Content */}
            {!loading && !error && (
                <>
                    {/* Search */}
                    <TextField
                        fullWidth
                        placeholder="Search symptoms (e.g. fever, pain, cough)"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
                            )
                        }}
                        sx={{ mb: 4 }}
                    />

                    {/* Symptoms List */}
                    <Paper
                        elevation={0}
                        sx={{
                            border: "1px solid #e5e7eb",
                            borderRadius: 3,
                            p: 3
                        }}
                    >
                        <Grid container spacing={2}>
                            {filteredSymptoms.map((symptom) => (
                                <Grid item xs={6} sm={4} md={3} key={symptom.id}>
                                    <Chip
                                        label={symptom.label}
                                        onClick={() => toggleSymptom(symptom.symptom_key)}
                                        color={
                                            selected.includes(symptom.symptom_key)
                                                ? "primary"
                                                : "default"
                                        }
                                        variant={
                                            selected.includes(symptom.symptom_key)
                                                ? "filled"
                                                : "outlined"
                                        }
                                        sx={{
                                            width: "100%",
                                            py: 2,
                                            fontSize: 14,
                                            fontWeight: 500
                                        }}
                                    />
                                </Grid>
                            ))}

                            {filteredSymptoms.length === 0 && (
                                <Typography
                                    color="text.secondary"
                                    textAlign="center"
                                    width="100%"
                                >
                                    No symptoms found
                                </Typography>
                            )}
                        </Grid>
                    </Paper>

                    {/* Selected Symptoms */}
                    {selected.length > 0 && (
                        <Box mt={4}>
                            <Typography fontWeight={600} mb={1}>
                                Selected symptoms ({selected.length})
                            </Typography>
                            <Box display="flex" gap={1} flexWrap="wrap">
                                {selected.map((key) => {
                                    const label = symptoms.find(
                                        (s) => s.symptom_key === key
                                    )?.label;

                                    return (
                                        <Chip
                                            key={key}
                                            label={label}
                                            onDelete={() => toggleSymptom(key)}
                                            color="primary"
                                            size="small"
                                        />
                                    );
                                })}
                            </Box>
                        </Box>
                    )}

                    {/* Confirm Button */}
                    <Box mt={5} textAlign="right">
                        <Button
                            variant="contained"
                            size="large"
                            disabled={selected.length === 0}
                            onClick={handleConfirm}
                            sx={{
                                px: 5,
                                py: 1.5,
                                fontSize: 16,
                                borderRadius: 2
                            }}
                        >
                            Continue
                        </Button>
                    </Box>
                </>
            )}
        </Container>
    );
}

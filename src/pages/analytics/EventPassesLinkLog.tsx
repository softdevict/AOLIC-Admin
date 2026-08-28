import React, { useEffect, useState } from "react";
import axios from "axios";
import { digital_pass } from "../../api/config";
import { useNavigate } from "react-router-dom";
import {
    Container,
    Grid,
    Card,
    CardContent,
    CardActions,
    Typography,
    Chip,
    Button,
    Box,
    CircularProgress,
    Alert,
    useTheme,
    useMediaQuery,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

interface EventType {
    _id: string;
    name: string;
    passId: string;
    startDate?: string;
    endDate?: string;
    active: boolean;
}

function EventPassesLinkLog() {
    const [events, setEvents] = useState<EventType[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await axios.get(`${digital_pass}/all`);
            setEvents(res.data?.data || []);
        } catch (err) {
            console.error("❌ Error fetching events:", err);
        } finally {
            setLoading(false);
        }
    };

    const goToDetails = (eventId: string) => {
        navigate(`/analytics/event_passes_linkLog/${eventId}`);
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return "—";
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, display: "flex", justifyContent: "center" }}>
                <CircularProgress size={60} />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom fontWeight="bold" color="primary">
                    <EventIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                    All Events
                </Typography>
                <Typography variant="body1" color="textSecondary">
                    Manage and view details for your event passes.
                </Typography>
            </Box>

            {events.length === 0 ? (
                <Alert severity="info" sx={{ mb: 2 }}>
                    No events found. Create your first event to get started!
                </Alert>
            ) : (
                <Grid container spacing={3}>
                    {events.map((event) => {
                        const isActive = event.active;
                        const statusColor = isActive ? "success" : "error";
                        const statusIcon = isActive ? <CheckCircleIcon /> : <CancelIcon />;

                        return (
                            <Grid item xs={12} sm={6} md={4} key={event._id}>
                                <Card
                                    sx={{
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        transition: "transform 0.2s, box-shadow 0.2s",
                                        "&:hover": {
                                            transform: "translateY(-4px)",
                                            boxShadow: theme.shadows[8],
                                        },
                                    }}
                                >
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        {/* Header */}
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                            <Typography variant="h6" fontWeight="bold" color="primary">
                                                {event.name}
                                            </Typography>
                                            <Chip
                                                icon={statusIcon}
                                                label={isActive ? "Active" : "Expired"}
                                                color={statusColor}
                                                size="small"
                                                variant="filled"
                                            />
                                        </Box>

                                        {/* Pass ID */}
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                                Pass ID
                                            </Typography>
                                            <Typography variant="subtitle1" fontWeight="medium" color="textPrimary">
                                                {event.passId}
                                            </Typography>
                                        </Box>

                                        {/* Dates */}
                                        <Box sx={{ mb: 2 }}>
                                            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                                                <AccessTimeIcon sx={{ mr: 1, color: "textSecondary", fontSize: 18 }} />
                                                <Typography variant="body2" color="textSecondary">
                                                    Start Date
                                                </Typography>
                                            </Box>
                                            <Typography variant="body1" color="textPrimary">
                                                {formatDate(event.startDate)}
                                            </Typography>
                                        </Box>

                                        <Box>
                                            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                                                <AccessTimeIcon sx={{ mr: 1, color: "textSecondary", fontSize: 18 }} />
                                                <Typography variant="body2" color="textSecondary">
                                                    End Date
                                                </Typography>
                                            </Box>
                                            <Typography variant="body1" color={isActive ? "textPrimary" : "error"}>
                                                {formatDate(event.endDate)}
                                            </Typography>
                                        </Box>
                                    </CardContent>

                                    {/* Actions */}
                                    <CardActions sx={{ mt: "auto", px: 2, pb: 2 }}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            onClick={() => goToDetails(event._id)}
                                            startIcon={<EventIcon />}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            View Details
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Container>
    );
}

export default EventPassesLinkLog;
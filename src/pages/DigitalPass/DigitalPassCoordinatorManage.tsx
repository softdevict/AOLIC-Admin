import React, { useEffect, useState } from "react";
import axios from "axios";
import { searchUser_email_phone, digital_pass } from "../../api/config";
import {
    Box,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Snackbar,
    Alert,
    Typography,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Badge,
} from "@mui/material";
import GradientNavButton from "../../components/button/NavButton"
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import AddIcon from "@mui/icons-material/Add";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DeleteIcon from '@mui/icons-material/Delete';

function DigitalPassCoordinatorManage() {
    // Main search state
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // All coordinators state
    const [allCoordinators, setAllCoordinators] = useState<any[]>([]);
    const [loadingCoordinators, setLoadingCoordinators] = useState(true);

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogSearchTerm, setDialogSearchTerm] = useState("");
    const [dialogUsers, setDialogUsers] = useState<any[]>([]);
    const [dialogLoading, setDialogLoading] = useState(false);

    // Notification state
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    // Load all coordinators on component mount
    useEffect(() => {
        loadAllCoordinators();
    }, []);

    // Fetch all existing coordinators
    const loadAllCoordinators = async () => {
        setLoadingCoordinators(true);
        try {
            const response = await axios.get(
                `${digital_pass}/coordinator/displayAllCordinatores`
            );
            setAllCoordinators(response.data.data || []);
        } catch (error) {
            console.error("Failed to load coordinators:", error);
            showNotification("Failed to load coordinators", "error");
        } finally {
            setLoadingCoordinators(false);
        }
    };

    // Main search functionality
    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            showNotification("Please enter email or phone to search", "error");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(
                `${searchUser_email_phone}?email=${encodeURIComponent(searchTerm)}`
            );
            setUsers(response.data.data || []);
        } catch (error) {
            console.error("Search error:", error);
            setUsers([]);
            showNotification("Failed to search users", "error");
        } finally {
            setLoading(false);
        }
    };

    // Dialog search functionality
    const handleDialogSearch = async () => {
        if (!dialogSearchTerm.trim()) {
            showNotification("Please enter email or phone to search", "error");
            return;
        }

        setDialogLoading(true);
        try {
            const response = await axios.get(
                `${searchUser_email_phone}?email=${encodeURIComponent(dialogSearchTerm)}`
            );
            setDialogUsers(response.data.data || []);
        } catch (error) {
            console.error("Dialog search error:", error);
            setDialogUsers([]);
            showNotification("Failed to search users", "error");
        } finally {
            setDialogLoading(false);
        }
    };

    // Toggle coordinator status
    const handleToggleCoordinator = async (
        userId: string,
        currentStatus: boolean,
        isDialog: boolean = false
    ) => {
        try {
            await axios.get(`${digital_pass}/coordinator/toggle/${userId}`);

            // Update the appropriate state based on context
            if (isDialog) {
                setDialogUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user._id === userId
                            ? { ...user, isActiveCordinator: !currentStatus }
                            : user
                    )
                );
            } else {
                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user._id === userId
                            ? { ...user, isActiveCordinator: !currentStatus }
                            : user
                    )
                );
            }

            // Reload coordinators list to reflect changes
            await loadAllCoordinators();

            showNotification(
                `Coordinator access ${!currentStatus ? "enabled" : "disabled"} successfully`,
                "success"
            );
        } catch (error) {
            console.error("Toggle error:", error);
            showNotification("Failed to toggle coordinator status", "error");
        }
    };

    // Helper function to show notifications
    const showNotification = (message: string, severity: "success" | "error") => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
        setSnackbarMessage("");
    };

    const handleOpenDialog = () => {
        setDialogOpen(true);
        setDialogSearchTerm("");
        setDialogUsers([]);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setDialogSearchTerm("");
        setDialogUsers([]);
    };

    // Calculate active coordinators count
    const activeCoordinatorsCount = allCoordinators.filter(
        (c) => c.isActiveCordinator
    ).length;
    const adminType = localStorage.getItem("adminType");
    return (
        <Box sx={{ p: 3 }}>
            {/* Header Section with Add Button */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                }}
            >
                <Typography variant="h4">Manage Coordinators</Typography>
                {adminType === "super admin" && (<>
                    <GradientNavButton to="/my_dashboard/hod">
                        Manage HOD
                    </GradientNavButton>

                    <GradientNavButton to="/my_dashboard/approver">
                        Manage Approver
                    </GradientNavButton>
                    <GradientNavButton to="/my_dashboard/passApplayMessage">
                        Apply Message
                    </GradientNavButton>

                </>)}


                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleOpenDialog}
                    sx={{ minWidth: 150 }}
                >
                    Add Coordinator
                </Button>
            </Box>

            {/* Active Coordinators Section */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                    }}
                >
                    <Typography variant="h6">Active Coordinators</Typography>
                    <Badge badgeContent={activeCoordinatorsCount} color="primary">
                        <PersonAddIcon />
                    </Badge>
                </Box>

                {loadingCoordinators ? (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : allCoordinators.length > 0 ? (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Phone</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {allCoordinators.map((user) => (
                                    <TableRow key={user._id}>
                                        <TableCell>
                                            {`${user.first_name || ""} ${user.last_name || ""}`}
                                        </TableCell>
                                        <TableCell>{user.email || "N/A"}</TableCell>
                                        <TableCell>{user.phone || "N/A"}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.isActiveCordinator ? "Active" : "Inactive"}
                                                color={user.isActiveCordinator ? "success" : "default"}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton
                                                onClick={() =>
                                                    handleToggleCoordinator(
                                                        user._id,
                                                        user.isActiveCordinator,
                                                        false
                                                    )
                                                }
                                                color={user.isActiveCordinator ? "secondary" : "error"}
                                            >
                                                {user.isActiveCordinator ? (
                                                    <ToggleOnIcon />
                                                ) : (
                                                    <DeleteIcon />
                                                )}
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Typography>No coordinators found.</Typography>
                )}
            </Paper>

            

            {/* Add Coordinator Dialog/Popup */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>Add New Coordinator</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: "flex", gap: 2, mt: 2, mb: 3 }}>
                        <TextField
                            label="Search by Email or Phone"
                            variant="outlined"
                            value={dialogSearchTerm}
                            onChange={(e) => setDialogSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleDialogSearch()}
                            fullWidth
                            autoFocus
                        />
                        <Button
                            variant="contained"
                            onClick={handleDialogSearch}
                            disabled={dialogLoading || !dialogSearchTerm.trim()}
                            startIcon={dialogLoading ? <CircularProgress size={20} /> : null}
                            sx={{ minWidth: 120 }}
                        >
                            Search
                        </Button>
                    </Box>

                    {dialogUsers.length > 0 ? (
                        <>
                            <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
                                Found {dialogUsers.length} user{dialogUsers.length !== 1 ? "s" : ""}
                            </Typography>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            {/* <TableCell>Name</TableCell> */}
                                            <TableCell>Email</TableCell>
                                            <TableCell>Phone</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {dialogUsers.map((user) => (
                                            <TableRow key={user._id}>
                                                {/* <TableCell>
                                                    {`${user.first_name || ""} ${user.last_name || ""}`}
                                                </TableCell> */}
                                                <TableCell>{user.email || "N/A"}</TableCell>
                                                <TableCell>{user.phone || "N/A"}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={user.isActiveCordinator ? "Active" : "Inactive"}
                                                        color={user.isActiveCordinator ? "success" : "default"}
                                                        size="small"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        onClick={() =>
                                                            handleToggleCoordinator(
                                                                user._id,
                                                                user.isActiveCordinator,
                                                                true
                                                            )
                                                        }
                                                        color={user.isActiveCordinator ? "secondary" : "primary"}
                                                    >
                                                        {user.isActiveCordinator ? (
                                                            <ToggleOnIcon />
                                                        ) : (
                                                            <ToggleOffIcon />
                                                        )}
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    ) : dialogSearchTerm.trim() && !dialogLoading ? (
                        <Typography>No users found.</Typography>
                    ) : null}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Notification Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarSeverity}
                    sx={{ width: "100%" }}
                    elevation={6}
                    variant="filled"
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}

export default DigitalPassCoordinatorManage;
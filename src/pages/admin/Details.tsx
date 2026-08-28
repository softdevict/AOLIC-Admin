import React, { useEffect, useState } from "react";
import {
    Box,
    Paper,
    Typography,
    Container,
    Chip,
    Divider,
    CircularProgress,
    Button,
    FormControlLabel,
    Checkbox,
    FormGroup,
    FormControl,
    InputAdornment,
    TextField,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Card,
    CardContent,
    Grid,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { sub_admin, permissionType } from "../../api/config";
import axios from "axios";

interface SubType {
    _id: string;
    name: string;
}

interface Permission {
    _id: string;
    name: string;
    subTypes?: SubType[];
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
}

interface AdminPermission {
    _id: string;
    name: string;
    subTypes: SubType[]; // From backend response
}

interface SubAdminDetails {
    _id: string;
    name: string;
    email: string;
    type: string;
    permissions: AdminPermission[]; // Nested structure from API
    createdAt: string;
    updatedAt: string;
    __v: number;
    isActive: boolean;
}

interface SelectedPermissionState {
    [parentId: string]: string[]; // parentId -> array of selected subType IDs
}

const AdminDetails: React.FC = () => {
    const { adminId } = useParams<{ adminId: string }>();
    const navigate = useNavigate();
    const [admin, setAdmin] = useState<SubAdminDetails | null>(null);
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [permissionsLoading, setPermissionsLoading] = useState(true);
    const [selectedPermissions, setSelectedPermissions] = useState<SelectedPermissionState>({});
    const [editingPermissions, setEditingPermissions] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchPerm, setSearchPerm] = useState("");

    useEffect(() => {
        if (adminId) {
            fetchAllPermissions();
            fetchAdminDetails();
        }
    }, [adminId]);

    const fetchAllPermissions = async () => {
        try {
            const response = await axios.get(permissionType);
            setAllPermissions(response.data?.data || []);
        } catch (error) {
            console.error("Error fetching permissions:", error);
            toast.error("Failed to fetch permissions!", {
                position: "top-right",
                autoClose: 2500,
                theme: "colored",
            });
        } finally {
            setPermissionsLoading(false);
        }
    };

    const fetchAdminDetails = async () => {
        try {
            const response = await axios.get(`${sub_admin}/${adminId}`);
            const adminData = response.data?.data;
            if (adminData) {
                const { password, ...adminWithoutPassword } = adminData;

                // Convert admin permissions to selectedPermissions state
                const selected: SelectedPermissionState = {};
                if (adminData.permissions && Array.isArray(adminData.permissions)) {
                    adminData.permissions.forEach((perm: any) => {
                        if (perm._id && Array.isArray(perm.subTypes)) {
                            selected[perm._id] = perm.subTypes.map((st: any) => st._id);
                        }
                    });
                }

                setSelectedPermissions(selected);
                setAdmin(adminWithoutPassword as SubAdminDetails);
            } else {
                toast.error("Sub Admin not found!", {
                    position: "top-right",
                    autoClose: 2500,
                    theme: "colored",
                });
            }
        } catch (error) {
            console.error("Error fetching sub admin details:", error);
            toast.error("Failed to fetch sub admin details!", {
                position: "top-right",
                autoClose: 2500,
                theme: "colored",
            });
        } finally {
            setLoading(false);
        }
    };

    const getPermissionDisplayNames = (): string[] => {
        const names: string[] = [];
        Object.entries(selectedPermissions).forEach(([parentId, subIds]) => {
            const parent = allPermissions.find(p => p._id === parentId);
            if (parent && subIds.length > 0) {
                subIds.forEach(subId => {
                    const subType = parent.subTypes?.find(st => st._id === subId);
                    if (subType) {
                        names.push(`${parent.name} → ${subType.name}`);
                    }
                });
            }
        });
        return names;
    };

    const handleParentPermissionToggle = (parentId: string) => {
        const parent = allPermissions.find(p => p._id === parentId);
        if (!parent || !parent.subTypes) return;

        const allSubIds = parent.subTypes.map(st => st._id);
        const currentSubIds = selectedPermissions[parentId] || [];

        if (currentSubIds.length === allSubIds.length) {
            // All selected, remove all
            setSelectedPermissions(prev => {
                const newState = { ...prev };
                delete newState[parentId];
                return newState;
            });
        } else {
            // Not all selected, select all
            setSelectedPermissions(prev => ({
                ...prev,
                [parentId]: allSubIds
            }));
        }
    };

    const handleSubTypeToggle = (parentId: string, subTypeId: string) => {
        setSelectedPermissions(prev => {
            const currentSubs = prev[parentId] || [];
            let newSubs: string[];

            if (currentSubs.includes(subTypeId)) {
                newSubs = currentSubs.filter(id => id !== subTypeId);
            } else {
                newSubs = [...currentSubs, subTypeId];
            }

            if (newSubs.length === 0) {
                const newState = { ...prev };
                delete newState[parentId];
                return newState;
            }

            return {
                ...prev,
                [parentId]: newSubs
            };
        });
    };

    const isParentChecked = (parentId: string): boolean => {
        const parent = allPermissions.find(p => p._id === parentId);
        if (!parent || !parent.subTypes) return false;

        const allSubIds = parent.subTypes.map(st => st._id);
        const currentSubIds = selectedPermissions[parentId] || [];

        return allSubIds.length > 0 && currentSubIds.length === allSubIds.length;
    };

    const isParentIndeterminate = (parentId: string): boolean => {
        const parent = allPermissions.find(p => p._id === parentId);
        if (!parent || !parent.subTypes) return false;

        const allSubIds = parent.subTypes.map(st => st._id);
        const currentSubIds = selectedPermissions[parentId] || [];

        return currentSubIds.length > 0 && currentSubIds.length < allSubIds.length;
    };

    const filteredPermissions = allPermissions.filter(perm =>
        perm.name.toLowerCase().includes(searchPerm.toLowerCase()) ||
        perm.subTypes?.some(st => st.name.toLowerCase().includes(searchPerm.toLowerCase()))
    );

    const handleSavePermissions = async () => {
        if (!adminId) return;

        // Collect all selected subType IDs (flat array)
        const allSelectedSubIds = Object.values(selectedPermissions).flat();

        try {
            setSaving(true);
            await axios.put(`${sub_admin}/${adminId}`, { subPermissions: allSelectedSubIds });

            toast.success("Permissions updated successfully!", {
                position: "top-right",
                autoClose: 2500,
                theme: "colored",
            });

            // Refresh admin details
            await fetchAdminDetails();
            setEditingPermissions(false);
            setSearchPerm("");
        } catch (error) {
            console.error("Error updating permissions:", error);
            toast.error("Failed to update permissions!", {
                position: "top-right",
                autoClose: 2500,
                theme: "colored",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        if (admin) {
            // Restore original permissions
            const selected: SelectedPermissionState = {};
            admin.permissions.forEach((perm: AdminPermission) => {
                if (perm._id && perm.subTypes) {
                    selected[perm._id] = perm.subTypes.map(st => st._id);
                }
            });
            setSelectedPermissions(selected);
        }
        setEditingPermissions(false);
        setSearchPerm("");
    };

    const handleEditPermissions = () => {
        setEditingPermissions(true);
    };

    const handleBack = () => {
        navigate("/subadmin");
    };

    const getTotalSelectedCount = () => {
        return Object.values(selectedPermissions).reduce((sum, subs) => sum + subs.length, 0);
    };

    if (loading || permissionsLoading) {
        return (
            <Container maxWidth="lg" sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
                <CircularProgress size={60} />
            </Container>
        );
    }

    if (!admin) {
        return (
            <Container maxWidth="lg">
                <Paper elevation={3} sx={{ p: 4, mt: 4, textAlign: "center" }}>
                    <CancelIcon sx={{ fontSize: 60, color: "error.main", mb: 2 }} />
                    <Typography variant="h6" color="error" gutterBottom>
                        Sub Admin not found
                    </Typography>
                    <Button onClick={handleBack} variant="contained" sx={{ mt: 2 }}>
                        Back to List
                    </Button>
                </Paper>
            </Container>
        );
    }

    const permNames = getPermissionDisplayNames();

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <ToastContainer />

            {/* Header */}
            <Paper elevation={4} sx={{ p: 3, mb: 3, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                            Sub Admin Details
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            Manage sub-administrator information and permissions
                        </Typography>
                    </Box>
                    <Button
                        onClick={handleBack}
                        variant="contained"
                        size="large"
                        sx={{
                            bgcolor: "white",
                            color: "primary.main",
                            "&:hover": { bgcolor: "grey.100" }
                        }}
                    >
                        Back to List
                    </Button>
                </Box>
            </Paper>

            {/* Admin Information */}
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3, color: "primary.main" }}>
                    Administrator Information
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="caption" color="textSecondary" gutterBottom>
                                    Full Name
                                </Typography>
                                <Typography variant="h6" fontWeight="medium">
                                    {admin.name}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="caption" color="textSecondary" gutterBottom>
                                    Email Address
                                </Typography>
                                <Typography variant="h6" fontWeight="medium">
                                    {admin.email}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="caption" color="textSecondary" gutterBottom>
                                    Admin Type
                                </Typography>
                                <Typography variant="body1" fontWeight="medium">
                                    {admin.type}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="caption" color="textSecondary" gutterBottom>
                                    Status
                                </Typography>
                                <Box sx={{ mt: 1 }}>
                                    <Chip
                                        icon={admin.isActive ? <CheckCircleIcon /> : <CancelIcon />}
                                        label={admin.isActive ? "Active" : "Inactive"}
                                        color={admin.isActive ? "success" : "error"}
                                        sx={{ fontWeight: "bold" }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="caption" color="textSecondary" gutterBottom>
                                    Admin ID
                                </Typography>
                                <Typography variant="body2" fontWeight="medium" sx={{ wordBreak: "break-all" }}>
                                    {admin._id}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="caption" color="textSecondary" gutterBottom>
                                    Created Date
                                </Typography>
                                <Typography variant="body1">
                                    {new Date(admin.createdAt).toLocaleString('en-US', {
                                        dateStyle: 'medium',
                                        timeStyle: 'short'
                                    })}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="caption" color="textSecondary" gutterBottom>
                                    Last Updated
                                </Typography>
                                <Typography variant="body1">
                                    {new Date(admin.updatedAt).toLocaleString('en-US', {
                                        dateStyle: 'medium',
                                        timeStyle: 'short'
                                    })}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Paper>

            {/* Permissions Section */}
            <Paper elevation={3} sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Box>
                        <Typography variant="h6" fontWeight="bold" color="primary.main">
                            Permissions Management
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            {getTotalSelectedCount()} permission{getTotalSelectedCount() !== 1 ? 's' : ''} selected
                        </Typography>
                    </Box>
                    {!editingPermissions && (
                        <Button
                            size="large"
                            onClick={handleEditPermissions}
                            variant="contained"
                            color="primary"
                            sx={{ px: 4 }}
                        >
                            Edit Permissions
                        </Button>
                    )}
                </Box>

                <Divider sx={{ mb: 3 }} />

                {editingPermissions ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {/* Search Bar */}
                        <TextField
                            variant="outlined"
                            placeholder="Search permissions by name..."
                            value={searchPerm}
                            onChange={(e) => setSearchPerm(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon color="primary" />
                                    </InputAdornment>
                                ),
                            }}
                            fullWidth
                            size="medium"
                        />

                        {/* Permissions List */}
                        <Paper variant="outlined" sx={{ maxHeight: 500, overflow: 'auto', p: 2, bgcolor: "grey.50" }}>
                            {filteredPermissions.length > 0 ? (
                                filteredPermissions.map((perm) => (
                                    <Accordion
                                        key={perm._id}
                                        elevation={1}
                                        sx={{
                                            mb: 1,
                                            "&:before": { display: "none" },
                                            borderRadius: 1,
                                        }}
                                    >
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            sx={{
                                                bgcolor: "white",
                                                "&:hover": { bgcolor: "grey.100" }
                                            }}
                                        >
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={isParentChecked(perm._id)}
                                                        indeterminate={isParentIndeterminate(perm._id)}
                                                        onChange={() => handleParentPermissionToggle(perm._id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        color="primary"
                                                    />
                                                }
                                                label={
                                                    <Box>
                                                        <Typography fontWeight="bold">
                                                            {perm.name}
                                                        </Typography>
                                                        {perm.subTypes && perm.subTypes.length > 0 && (
                                                            <Typography variant="caption" color="textSecondary">
                                                                {perm.subTypes.length} sub-permission{perm.subTypes.length !== 1 ? 's' : ''}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                }
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </AccordionSummary>
                                        {perm.subTypes && perm.subTypes.length > 0 && (
                                            <AccordionDetails sx={{ bgcolor: "grey.50", pt: 2 }}>
                                                <FormControl component="fieldset" sx={{ pl: 4, width: "100%" }}>
                                                    <FormGroup>
                                                        {perm.subTypes.map((subType) => (
                                                            <FormControlLabel
                                                                key={subType._id}
                                                                control={
                                                                    <Checkbox
                                                                        checked={(selectedPermissions[perm._id] || []).includes(subType._id)}
                                                                        onChange={() => handleSubTypeToggle(perm._id, subType._id)}
                                                                        color="primary"
                                                                    />
                                                                }
                                                                label={
                                                                    <Typography variant="body2">
                                                                        {subType.name}
                                                                    </Typography>
                                                                }
                                                                sx={{ mb: 1 }}
                                                            />
                                                        ))}
                                                    </FormGroup>
                                                </FormControl>
                                            </AccordionDetails>
                                        )}
                                    </Accordion>
                                ))
                            ) : (
                                <Box sx={{ textAlign: "center", py: 4 }}>
                                    <Typography color="textSecondary">
                                        No permissions found matching your search
                                    </Typography>
                                </Box>
                            )}
                        </Paper>

                        {/* Action Buttons */}
                        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                            <Button
                                onClick={handleCancelEdit}
                                variant="outlined"
                                disabled={saving}
                                size="large"
                                sx={{ px: 4 }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSavePermissions}
                                variant="contained"
                                color="primary"
                                disabled={saving}
                                size="large"
                                sx={{ px: 4 }}
                            >
                                {saving ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
                            </Button>
                        </Box>
                    </Box>
                ) : (
                    <Paper variant="outlined" sx={{ p: 3, bgcolor: "grey.50" }}>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                            {permNames.length > 0 ? (
                                permNames.map((permName, index) => (
                                    <Chip
                                        key={index}
                                        label={permName}
                                        color="primary"
                                        variant="outlined"
                                        sx={{
                                            fontWeight: "medium",
                                            py: 2.5,
                                            fontSize: "0.875rem"
                                        }}
                                    />
                                ))
                            ) : (
                                <Box sx={{ textAlign: "center", width: "100%", py: 4 }}>
                                    <Typography variant="body1" color="textSecondary">
                                        No permissions assigned to this administrator
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Paper>
                )}
            </Paper>
        </Container>
    );
};

export default AdminDetails;
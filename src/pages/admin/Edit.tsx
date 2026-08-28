import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Paper,
    TextField,
    Typography,
    CircularProgress,
    Container,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { sub_admin } from "../../api/config";
import axios from "axios";

interface SubAdmin {
    id: string;
    name: string;
    email: string;
}

const AdminEdit: React.FC = () => {
    const { adminId } = useParams<{ adminId: string }>();
    const navigate = useNavigate();
    const [admin, setAdmin] = useState<SubAdmin | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    useEffect(() => {
        if (adminId) {
            fetchAdmin();
        }
    }, [adminId]);

    const fetchAdmin = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${sub_admin}/${adminId}`);
            const adminData = response.data?.data;
            if (adminData) {
                setAdmin({
                    id: adminData._id,
                    name: adminData.name,
                    email: adminData.email,
                });
                setFormData({
                    name: adminData.name,
                    email: adminData.email,
                    password: "",
                    confirmPassword: "",
                });
            }
        } catch (error) {
            console.error("Error fetching sub admin:", error);
            toast.error("Failed to fetch sub admin!", {
                position: "top-right",
                autoClose: 2500,
                theme: "colored",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        if (!adminId || !formData.name || !formData.email) {
            toast.error("Please fill in all required fields!", {
                position: "top-right",
                autoClose: 2500,
                theme: "colored",
            });
            return;
        }

        if (formData.password && formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match!", {
                position: "top-right",
                autoClose: 2500,
                theme: "colored",
            });
            return;
        }

        try {
            setUpdating(true);
            const updateData: any = {
                name: formData.name,
                email: formData.email,
            };

            if (formData.password) {
                updateData.password = formData.password;
            }

            await axios.patch(`${sub_admin}/${adminId}`, updateData);
            setAdmin((prev) => prev ? { ...prev, name: formData.name, email: formData.email } : null);
            toast.success("Sub Admin updated successfully!", {
                position: "top-right",
                autoClose: 2500,
                theme: "colored",
            });
            navigate("/subadmin");
        } catch (error) {
            console.error("Error updating sub admin:", error);
            toast.error("Failed to update sub admin!", {
                position: "top-right",
                autoClose: 2500,
                theme: "colored",
            });
        } finally {
            setUpdating(false);
        }
    };

    const handleCancel = () => {
        navigate("/subadmin");
    };

    if (loading) {
        return (
            <Container maxWidth="sm" sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
                <CircularProgress />
            </Container>
        );
    }

    if (!admin) {
        return (
            <Container maxWidth="sm">
                <Typography variant="h6" color="error">
                    Sub Admin not found.
                </Typography>
                <Button onClick={handleCancel} variant="outlined" sx={{ mt: 2 }}>
                    Back to List
                </Button>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm">
            <ToastContainer />
            <Paper elevation={4} sx={{ p: 4, mt: 4, borderRadius: 3 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Edit Sub Admin
                </Typography>
                <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <TextField
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        fullWidth
                        required
                    />
                    <TextField
                        label="New Password (Optional)"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        fullWidth
                        helperText="Leave blank to keep current password"
                    />
                    <TextField
                        label="Confirm New Password"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        fullWidth
                        helperText="Only required if changing password"
                    />
                    <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                        <Button onClick={handleCancel} variant="outlined" disabled={updating}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdate}
                            variant="contained"
                            color="primary"
                            disabled={updating}
                        >
                            {updating ? <CircularProgress size={24} /> : "Update Sub Admin"}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default AdminEdit;
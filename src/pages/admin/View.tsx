import React, { useEffect, useState } from "react";
import {
    IconButton,
    Tooltip,
    TextField,
    InputAdornment,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Switch,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";
import IconTrash from "../../components/Icon/IconTrash";
import IconPencilPaper from "../../components/Icon/IconPencilPaper";
import IconEye from "../../components/Icon/IconEye";
import NavButton from "../../components/button/NavButton";
import { sub_admin } from "../../api/config";
import axios from "axios";

interface SubAdmin {
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    status: string;
}

const SubAdminView: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);
    const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSubAdmins = async () => {
            try {
                setLoading(true);
                const response = await axios.get(sub_admin);
                const rawData = response.data?.data || [];
                if (Array.isArray(rawData)) {
                    const adminsData = rawData.map((admin: any) => ({
                        id: admin._id,
                        name: admin.name,
                        email: admin.email,
                        password: admin.view || 'Not set',
                        role: "Sub Admin",
                        status: admin.isActive ? "Active" : "Inactive",
                    }));
                    setSubAdmins(adminsData);
                } else {
                    setSubAdmins([]);
                }
            } catch (error) {
                console.error("Error fetching sub admins:", error);
                toast.error("Failed to fetch sub admins!", {
                    position: "top-right",
                    autoClose: 2500,
                    theme: "colored",
                });
                setSubAdmins([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSubAdmins();
    }, []);

    const filteredSubAdmins = subAdmins.filter(
        (subAdmin) =>
            subAdmin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            subAdmin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            subAdmin.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const togglePasswordVisibility = (id: string) => {
        setShowPassword(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`${sub_admin}/${id}`);
            setSubAdmins(subAdmins.filter((subAdmin) => subAdmin.id !== id));
            toast.success("🗑️ Sub Admin deleted successfully!", {
                position: "top-right",
                autoClose: 2500,
                theme: "colored",
            });
        } catch (error) {
            console.error("Error deleting sub admin:", error);
            toast.error("Failed to delete sub admin!", {
                position: "top-right",
                autoClose: 2500,
                theme: "colored",
            });
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        try {
            await axios.patch(`${sub_admin}/toggle-status/${id}`);
            const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
            const updatedAdmins = subAdmins.map((admin) =>
                admin.id === id
                    ? { ...admin, status: newStatus }
                    : admin
            );
            setSubAdmins(updatedAdmins);
            toast.success(`Status toggled to ${newStatus}!`, {
                position: "top-right",
                autoClose: 2500,
                theme: "colored",
            });
        } catch (error) {
            console.error("Error toggling status:", error);
            toast.error("Failed to toggle status!", {
                position: "top-right",
                autoClose: 2500,
                theme: "colored",
            });
        }
    };

    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
                <h3>Loading sub admins...</h3>
            </div>
        );
    }

    return (
        <>
            {/* Breadcrumb */}
            <ol className="flex text-gray-500 font-semibold space-x-2 mb-4">
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>/</li>
                <li className="text-black">Manage Sub Admins</li>
            </ol>
            <div>
                <ToastContainer />
                <Paper
                    elevation={4}
                    sx={{
                        maxWidth: 1000,
                        margin: "auto",
                        borderRadius: 3,
                        padding: 3,
                        background: "#fff",
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 20,
                        }}
                    >
                        <h2
                            style={{
                                fontSize: "1.6rem",
                                fontWeight: 700,
                                color: "#1e293b",
                            }}
                        >
                            Manage Sub Admins
                        </h2>
                        {/* Gradient Add Button */}
                        <NavButton
                            to="/subadmin/add"
                            startIcon={<AddIcon />}
                            sx={{
                                fontSize: "14px",
                                paddingX: 3,
                                paddingY: 1,
                                background: "linear-gradient(to right, #56ccf2, #2f80ed)",
                            }}
                        >
                            Add Sub Admin
                        </NavButton>
                    </div>
                    {/* Search */}
                    <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Search by name, email, or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ mb: 3 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    {/* Table */}
                    <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: "#eff6ff" }}>
                                    <TableCell sx={{ fontWeight: 600 }}>No.</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Password</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredSubAdmins.length > 0 ? (
                                    filteredSubAdmins.map((subAdmin, index) => (
                                        <TableRow
                                            key={subAdmin.id}
                                            hover
                                            sx={{
                                                "&:hover": { backgroundColor: "#f9fafb" },
                                            }}
                                        >
                                            {/* Serial Number Column */}
                                            <TableCell sx={{ fontWeight: 500, width: "50px" }}>
                                                {index + 1}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 500 }}>{subAdmin.name}</TableCell>
                                            <TableCell>{subAdmin.email}</TableCell>
                                            <TableCell>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <span style={{ minWidth: 100 }}>
                                                        {showPassword[subAdmin.id] ? subAdmin.password : "••••••••"}
                                                    </span>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => togglePasswordVisibility(subAdmin.id)}
                                                        sx={{ padding: 0.5 }}
                                                    >
                                                        {showPassword[subAdmin.id] ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                                                    </IconButton>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={subAdmin.status === "Active"}
                                                    onChange={() => handleToggleStatus(subAdmin.id, subAdmin.status)}
                                                    color="primary"
                                                />
                                            </TableCell>
                                            {/* Action Buttons */}
                                            <TableCell align="center">
                                                <Tooltip title="View">
                                                    <IconButton
                                                        sx={{ color: "#2563EB" }}
                                                        onClick={() => navigate(`/subadmin/view/${subAdmin.id}`)}
                                                    >
                                                        <IconEye />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit">
                                                    <IconButton
                                                        sx={{ color: "#2563EB" }}
                                                        onClick={() => navigate(`/subadmin/edit/${subAdmin.id}`)}
                                                    >
                                                        <IconPencilPaper />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton
                                                        sx={{ color: "#DC2626" }}
                                                        onClick={() => handleDelete(subAdmin.id)}
                                                    >
                                                        <IconTrash />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            align="center"
                                            sx={{ py: 4, color: "gray" }}
                                        >
                                            No sub admins found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </div>
        </>
    );
};

export default SubAdminView;
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import GroupIcon from "@mui/icons-material/Group";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
    IconButton,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    CircularProgress,
} from "@mui/material";
import GradientNavButton from "../../components/button/NavButton";
import { digital_pass, sub_admin } from "../../api/config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BarChartIcon from '@mui/icons-material/BarChart';

interface DigitalPass {
    _id: string;
    passId: string;
    name: string;
    logoImg?: string;
    qrImg?: string;
    backgroundImg?: string;
    bgColorCode?: string;
    textColorCode?: string;
    startDate: string;
    endDate: string;
    active: boolean;
    seatsCount: string;
    vehiclesCount: string;
    todayUserCount?: string;
    todayTotalSeatsUsed?: string;
}

const DigitalPassView: React.FC = () => {
    const [passes, setPasses] = useState<DigitalPass[]>([]);
    const [filter, setFilter] = useState<"all" | "active" | "expired">("all");
    const [loading, setLoading] = useState<boolean>(true);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedPassId, setSelectedPassId] = useState<string | null>(null);
    const navigate = useNavigate();

    const adminType = localStorage.getItem("adminType");
    const adminId = localStorage.getItem("adminId");

    const [allowedPassIds, setAllowedPassIds] = useState<string[]>([]);
    const [hodPassIds, setHodPassIds] = useState<string[]>([]);
    const [approverPassIds, setApproverPassIds] = useState<string[]>([]);

    // Fetch sub-admin data to get HOD and Approver pass IDs
    useEffect(() => {
        if (adminType !== "sub admin" || !adminId) return;

        const fetchSubAdminData = async () => {
            try {
                const response = await axios.get(`${sub_admin}/${adminId}`);
                console.log("Sub-admin data:", response.data);

                const hodIds = response.data?.data?.hod || [];
                const approverIds = response.data?.data?.approver || [];

                console.log("HOD Pass IDs:", hodIds);
                console.log("Approver Pass IDs:", approverIds);

                // Store separately for permission checking
                setHodPassIds(hodIds);
                setApproverPassIds(approverIds);

                // Combine both arrays and get unique pass IDs
                const combinedIds = [...new Set([...hodIds, ...approverIds])];
                console.log("Combined HOD and Approver IDs:", combinedIds);

                setAllowedPassIds(combinedIds);
            } catch (error) {
                console.error("Error fetching sub admin data:", error);
                toast.error("Failed to fetch user permissions");
            }
        };

        fetchSubAdminData();
    }, [adminId, adminType]);

    // Fetch passes from backend (always fetch all, filter client-side)
    const fetchPasses = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${digital_pass}/allDetails`);

            if (res.data?.success) {
                const rawPasses = res.data.data || [];
// console.log(rawPasses,"rawPasses ======")
                const mappedPasses: DigitalPass[] = rawPasses.map((p: any) => {
                    // console.log("🚀 ~ fetchPasses ~ original endDate:", p.endDate);

                    // Convert to JS Date
                    const endDate = new Date(p.endDate);

                    // Increase by 1 day
                    const increasedEndDate = new Date(endDate);
                    increasedEndDate.setDate(increasedEndDate.getDate() + 1);

                    // console.log("📅 ~ increased endDate:", increasedEndDate.toISOString());

                    return {
                        _id: p.eventId,
                        passId: p.eventId || "",
                        name: p.eventName || "",
                        logoImg: undefined,
                        qrImg: undefined,
                        backgroundImg: p.eventImage || undefined,
                        bgColorCode: p.backgroundColor ? `#${p.backgroundColor}` : undefined,
                        textColorCode: p.textColor ? `#${p.textColor}` : undefined,
                        startDate: p.startDate,

                        // store updated end date (1 day added)
                        endDate: increasedEndDate.toISOString(),

                        // Active logic using updated end date
                        active:
                            new Date(p.startDate) <= new Date() &&
                            increasedEndDate >= new Date(),

                        seatsCount: p.totalSeatCount?.toString() || "0",
                        vehiclesCount: p.totalVehicleCount?.toString() || "0",
                        todayUserCount: p.todayUserCount?.toString() || "0",
                        todayTotalSeatsUsed:
                            p.todayTotalSeatsUsed?.toString() || "0",
                    };
                });

                setPasses(mappedPasses);
            }

            else {
                setPasses([]);
            }
        } catch (error) {
            console.error("Error fetching event passes:", error);
            setPasses([]);
        } finally {
            setLoading(false);
        }
    };
console.log(passes,"ppppppppppppppppp")
    // Fetch passes once on mount
    useEffect(() => {
        fetchPasses();
    }, []);

    // Compute filtered passes based on admin type, allowed IDs, and filter
//     const filteredPasses = useMemo(() => {
//         let result = passes;

//         // Filter by allowed for sub admin
//         if (adminType === "sub admin") {
//             result = result.filter((pass: DigitalPass) =>
//                 allowedPassIds.includes(pass._id)
//             );
//         }
// // console.log(pas)
//         // Filter by status
//         if (filter === "active") {
//             result = result.filter((pass: DigitalPass) => pass.active);
//         } else if (filter === "expired") {
//             result = result.filter((pass: DigitalPass) => !pass.active);
//         }

//         return result;
//     }, [passes, filter, allowedPassIds, adminType]);

const filteredPasses = useMemo(() => {
    let result = passes;

    // Apply filter only for sub admin when IDs exist
    if (adminType === "sub admin" && allowedPassIds.length > 0) {
        result = result.filter((pass: DigitalPass) =>
            allowedPassIds.includes(pass._id)
        );
    }

    // Status filter
    if (filter === "active") {
        result = result.filter((pass: DigitalPass) => pass.active);
    } else if (filter === "expired") {
        result = result.filter((pass: DigitalPass) => !pass.active);
    }

    return result;
}, [passes, filter, allowedPassIds, adminType]);

    const getDaysRemaining = (endDate: string) => {
        const end = new Date(endDate);
        const today = new Date();
        const diffTime = end.getTime() - today.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, passId: string) => {
        setAnchorEl(event.currentTarget);
        setSelectedPassId(passId);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedPassId(null);
    };

    // Edit Pass
    const handleEdit = () => {
        if (selectedPassId) {
            navigate(`/digitalPass/edit/${selectedPassId}`);
            handleMenuClose();
        }
    };

    // Manage Users
    const handleUserManage = () => {
        if (selectedPassId) {
            navigate(`/digitalPass/user/${selectedPassId}`);
            handleMenuClose();
        }
    };

    // All Pass
    const handleAllPass = () => {
        if (selectedPassId) {
            navigate(`/digitalPass/allPass/${selectedPassId}`);
            handleMenuClose();
        }
    };

    // View Form Templates
    const handleFormView = () => {
        if (selectedPassId) {
            const selectedPass = passes.find(p => p._id === selectedPassId);

            navigate(`/digitalPass/form/view/${selectedPassId}`, {
                state: {
                    passName: selectedPass?.name || "Event Pass"
                }
            });

            handleMenuClose();
        }
    };

    // Delete Pass
    const handleDelete = async () => {
        if (!selectedPassId) return;
        try {
            const confirmed = window.confirm("Are you sure you want to delete this event pass?");
            if (!confirmed) {
                handleMenuClose();
                return;
            }

            const res = await axios.delete(`${digital_pass}/${selectedPassId}`);
            if (res.data?.success) {
                toast.success("✅ Event pass deleted successfully!");
                setPasses((prev) => prev.filter((p) => p._id !== selectedPassId));
            } else {
                toast.error("❌ Failed to delete event pass.");
            }
        } catch (error: any) {
            console.error("Error deleting event pass:", error);
            toast.error(error.response?.data?.message || "Server error while deleting pass.");
        } finally {
            handleMenuClose();
        }
    };

    // Analytics
    const handleAnalytics = async () => {
        // console.log("🚀 ~ handleAnalytics ~ selectedPassId:", selectedPassId)
        if (!selectedPassId) return;
        navigate(`/analytics/event_passes_linkLog/${selectedPassId}`)
    }
console.log(filteredPasses,"filteredPasses.length")
    return (
        <div>
            <ToastContainer />
            {/* Breadcrumb */}
            {adminType === "super admin" && (
                <ol className="flex items-center text-gray-500 font-semibold space-x-2 mb-4 bg-gray-50 p-3 rounded-lg">
                    <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
                    <li>/</li>
                    <li className="text-black">Event Passes</li>
                </ol>
            )}
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
                    <h1 className="text-4xl font-bold text-gray-800 text-center sm:text-left">
                        🎫 Event Passes
                    </h1>

                    <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row sm:items-center gap-4">
                        {adminType === "super admin" && (
                            <>
                                <GradientNavButton to="/my_dashboard/mamber">
                                    Department Type
                                </GradientNavButton>
                                <GradientNavButton to="/digitalPass/coordinator">
                                    Coordinator
                                </GradientNavButton>
                                <GradientNavButton to="/my_dashboard/location">
                                    Geo Locations
                                </GradientNavButton>
                                <GradientNavButton to="/digitalPass/add">
                                    Create Event Pass
                                </GradientNavButton>
                            </>
                        )}
                        <select
                            value={filter}
                            onChange={(e) =>
                                setFilter(e.target.value as "all" | "active" | "expired")
                            }
                            className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm min-w-[140px] appearance-none bg-no-repeat bg-[right_0.5rem_center] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIGZpbGw9IiM5Q0E2QjIiIHN0cm9rZT0iIzlDQTZCMiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+')] pr-8"
                        >
                            <option value="all">All</option>
                            <option value="active">Active</option>
                            <option value="expired">Inactive</option>
                        </select>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-16 bg-white rounded-2xl shadow-sm">
                        <CircularProgress sx={{ color: "#4A70A9" }} />
                        <span className="ml-3 text-[#4A70A9] font-medium">Loading event passes...</span>
                    </div>
                )}

                {/* Pass Cards */}
                {!loading && filteredPasses.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredPasses.map((pass) => {
                            console.log("🚀 ~ DigitalPassView ~ pass: ====", pass)
                            const daysRemaining = getDaysRemaining(pass.endDate);
                            const isExpiringSoon = daysRemaining <= 30 && daysRemaining > 0;

                            return (
                                <div
                                    key={pass._id}
                                    className="relative bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group"
                                >
                                    {/* 3-dot menu */}
                                    <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <IconButton
                                            onClick={(e) => handleMenuOpen(e, pass._id)}
                                            size="small"
                                            sx={{
                                                backgroundColor: "rgba(255,255,255,0.9)",
                                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                                backdropFilter: "blur(10px)",
                                                "&:hover": {
                                                    backgroundColor: "rgba(255,255,255,1)",
                                                    transform: "scale(1.05)",
                                                },
                                            }}
                                        >
                                            <MoreVertIcon sx={{ color: "#374151", fontSize: 20 }} />
                                        </IconButton>
                                    </div>

                                    {/* Status Ribbon */}
                                    <div
                                        className={`absolute top-4 left-4 z-20 px-4 py-2 rounded-full text-sm font-bold shadow-lg transform rotate-[-2deg] ${pass.active
                                            ? isExpiringSoon
                                                ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white"
                                                : "bg-gradient-to-r from-emerald-400 to-teal-500 text-white"
                                            : "bg-gradient-to-r from-red-400 to-rose-500 text-white"
                                            }`}
                                    >
                                        {pass.active
                                            ? isExpiringSoon
                                                ? `⚠️ Expires in ${daysRemaining} days`
                                                : "✅ Active"
                                            : "❌ Inactive"}
                                    </div>

                                    {/* Background */}
                                    <div className="relative h-48 overflow-hidden">
                                        {pass.backgroundImg ? (
                                            <img
                                                src={pass.backgroundImg}
                                                alt="Event background"
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div
                                                className="w-full h-full"
                                                style={{
                                                    backgroundColor: pass.bgColorCode || "#f3f4f6",
                                                }}
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
                                        {pass.logoImg && (
                                            <div className="absolute bottom-4 right-4">
                                                <img
                                                    src={pass.logoImg}
                                                    alt="Event Logo"
                                                    className="w-12 h-12 rounded-2xl border-4 border-white/90 shadow-lg ring-2 ring-white/50"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-6 bg-gradient-to-b from-white/80 to-white/50 backdrop-blur-sm">
                                        <h3 className="text-xl font-bold text-gray-800 mb-4 line-clamp-2">
                                            {pass.name}
                                        </h3>

                                        <div className="space-y-3">
                                            {/* <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                    <span className="text-sm font-medium text-gray-700">Total Seats Count</span>
                                                </div>
                                                <span className="text-sm text-gray-600 font-mono">
                                                    {pass.seatsCount}
                                                </span>
                                            </div> */}
                                            {/* <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                    <span className="text-sm font-medium text-gray-700">Used Count</span>
                                                </div>
                                                <span className="text-sm text-gray-600 font-mono">
                                                    {pass.todayTotalSeatsUsed}
                                                </span>
                                            </div> */}
                                            <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                    <span className="text-sm font-medium text-gray-700">Start Date</span>
                                                </div>
                                                <span className="text-sm text-gray-600 font-mono">
                                                    {new Date(pass.startDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-3 h-3 rounded-full ${pass.active ? "bg-green-500" : "bg-red-500"}`}></div>
                                                    <span className="text-sm font-medium text-gray-700">End Date</span>
                                                </div>
                                                <span className="text-sm text-gray-600 font-mono">
                                                    {/* {new Date(pass.endDate).toLocaleDateString()} */}
                                                    {new Date(new Date(pass.endDate).setDate(new Date(pass.endDate).getDate() - 1)).toLocaleDateString()}

                                                </span>
                                            </div>
                                        </div>

                                        {/* Quick Stats */}
                                        {daysRemaining > 0 && (
                                            <div className="mt-4 p-3 bg-blue-50/50 rounded-xl">
                                                <p className="text-xs text-blue-700 font-medium">
                                                    ⏰ {daysRemaining} days remaining
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredPasses.length === 0 && (
                    <div className="text-center py-20 bg-gradient-to-br from-gray-50 to-blue-50 rounded-3xl shadow-inner">
                        <div className="text-8xl mb-6 mx-auto">🎫</div>
                        <h3 className="text-3xl font-bold text-gray-700 mb-3">
                            No event passes found
                        </h3>
                        <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
                            {adminType === "sub admin"
                                ? "You don't have access to any event passes. Contact your administrator for access."
                                : filter === "all"
                                    ? "You don't have any event passes yet. Create one to get started!"
                                    : `No ${filter} event passes found. Try adjusting your filter.`
                            }
                        </p>
                        {adminType === "super admin" && (
                            <GradientNavButton to="/digitalPass/add" className="w-full max-w-xs">
                                Create Your First Event Pass
                            </GradientNavButton>
                        )}
                    </div>
                )}

                {/* MUI Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    PaperProps={{
                        sx: {
                            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                            borderRadius: "12px",
                            minWidth: "180px",
                        },
                    }}
                >
                    {/* {(adminType === "super admin" || hodPassIds.includes(selectedPassId || "")) && ( */}
                        <MenuItem onClick={handleEdit} sx={{ py: 1.5 }}>
                            <ListItemIcon>
                                <EditIcon fontSize="small" sx={{ color: "#3B82F6" }} />
                            </ListItemIcon>
                            <ListItemText>Edit Pass</ListItemText>
                        </MenuItem>
                    {/* )} */}

                    {/* Show "Manage Users" and "All Pass" only if pass ID is in Approver array */}
                    {(adminType === "super admin" || approverPassIds.includes(selectedPassId || "")) && (
                        <>
                            <MenuItem onClick={handleUserManage} sx={{ py: 1.5 }}>
                                <ListItemIcon>
                                    <GroupIcon fontSize="small" sx={{ color: "#6B7280" }} />
                                </ListItemIcon>
                                <ListItemText>Manage Users</ListItemText>
                            </MenuItem>

                            <MenuItem onClick={handleAllPass} sx={{ py: 1.5 }}>
                                <ListItemIcon>
                                    <VisibilityIcon fontSize="small" sx={{ color: "#6B7280" }} />
                                </ListItemIcon>
                                <ListItemText>All Pass</ListItemText>
                            </MenuItem>
                        </>
                    )}

                    {/* Show "View Forms" only if pass ID is in HOD array */}
                    {(adminType === "super admin" || hodPassIds.includes(selectedPassId || "")) && (
                        <MenuItem onClick={handleFormView} sx={{ py: 1.5 }}>
                            <ListItemIcon>
                                <EditIcon fontSize="small" sx={{ color: "#8B5CF6" }} />
                            </ListItemIcon>
                            <ListItemText>View Forms</ListItemText>
                        </MenuItem>
                    )}

                    {adminType === "super admin" && (
                        <MenuItem onClick={handleDelete} sx={{ py: 1.5 }}>
                            <ListItemIcon>
                                <DeleteIcon fontSize="small" sx={{ color: "#EF4444" }} />
                            </ListItemIcon>
                            <ListItemText>Delete Pass</ListItemText>
                        </MenuItem>
                    )}
                    {(adminType === "super admin" || hodPassIds.includes(selectedPassId || "")) && (
                        <MenuItem onClick={handleAnalytics} sx={{ py: 1.5 }}>
                            <ListItemIcon>
                                <BarChartIcon fontSize="small" sx={{ color: "#4BBDEB" }} />
                            </ListItemIcon>
                            <ListItemText>View Analytics</ListItemText>
                        </MenuItem>
                    )}
                </Menu>
            </div>
        </div>
    );
};

export default DigitalPassView;
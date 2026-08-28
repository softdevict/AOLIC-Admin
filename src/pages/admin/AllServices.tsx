import React, { useEffect, useState } from 'react';
import { sub_admin } from "../../api/config";
import axios from 'axios';
import {
    Home as HomeIcon,
    AutoGraph as AutoGraphIcon,
    Map as MapIcon,
    Explore as ExploreIcon,
    Album as AlbumIcon,
    Person as PersonIcon,
    DashboardCustomize as DashboardCustomizeIcon,
    LocalActivity as LocalActivityIcon,
    PhotoSizeSelectActual as PhotoSizeSelectActualIcon,
    YouTube as YouTubeIcon,
    LiveTv as LiveTvIcon,
    CalendarMonth as CalendarMonthIcon,
    AddPhotoAlternate as AddPhotoAlternateIcon,
    Sos as SosIcon,
    LocalPostOffice as LocalPostOfficeIcon,
    Notifications as NotificationsIcon,
    ConnectWithoutContact as ConnectWithoutContactIcon,
    Restore as RestoreIcon,
    ExpandMore as ExpandMoreIcon,
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import {
    Card,
    CardContent,
    Typography,
    Chip,
    Box,
    Avatar,
    Collapse,
    IconButton,
    Divider,
    Paper,
    CircularProgress,
} from '@mui/material';

interface Permissions {
    _id: string;
    name: string;
    subTypes: {
        _id: string;
        name: string;
    }[];
}

interface SubAdminData {
    _id: string;
    name: string;
    email: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    hod: string[];
    isHod: boolean;
    approver: string[];
    view: string;
    permissions?: Permissions[];
    __v: number;
}

// Icon mapping for permissions
const iconMap: { [key: string]: React.ReactNode } = {
    'Home': <HomeIcon />,
    'Analytics': <AutoGraphIcon />,
    'Ashram Maps': <MapIcon />,
    'Audio Tours': <ExploreIcon />,
    'Audio Guide': <AlbumIcon />,
    'AOL Logins': <PersonIcon />,
    'My Dashboard': <DashboardCustomizeIcon />,
    'Digital Passes': <LocalActivityIcon />,
    'Add On Boarding': <PhotoSizeSelectActualIcon />,
    'Peace OF Mind': <YouTubeIcon />,
    'Add Live Link': <LiveTvIcon />,
    'Add Next Live Session': <CalendarMonthIcon />,
    'Upcoming Programs': <AddPhotoAlternateIcon />,
    'SOS': <SosIcon />,
    'Popup': <LocalPostOfficeIcon />,
    'Notification': <NotificationsIcon />,
    'Footer': <ConnectWithoutContactIcon />,
    'History': <RestoreIcon />,
};

// Color mapping for different permissions
const colorMap: { [key: string]: string } = {
    'Home': '#3B82F6',
    'Analytics': '#8B5CF6',
    'Ashram Maps': '#10B981',
    'Audio Tours': '#F59E0B',
    'Audio Guide': '#EF4444',
    'AOL Logins': '#6366F1',
    'My Dashboard': '#EC4899',
    'Digital Passes': '#14B8A6',
    'Add On Boarding': '#F97316',
    'Peace OF Mind': '#06B6D4',
    'Add Live Link': '#84CC16',
    'Add Next Live Session': '#A855F7',
    'Upcoming Programs': '#F43F5E',
    'SOS': '#DC2626',
    'Popup': '#7C3AED',
    'Notification': '#0EA5E9',
    'Footer': '#059669',
    'History': '#6B7280',
};

function PasswordField({ password }: { password: string }) {
    const [show, setShow] = useState(false);
    return (
        <Box sx={{ flex: '1 1 200px', minWidth: '200px', position: "relative" }}>
            <Typography variant="caption" color="text.secondary">
                Password
            </Typography>
            <Typography variant="body2" fontWeight="medium">
                {show ? password : "••••••"}
            </Typography>
            {/* Toggle Icon */}
            <IconButton
                onClick={() => setShow(!show)}
                size="small"
                sx={{
                    position: "absolute",
                    top: 18,
                    right: -5,
                }}
            >
                {show ? <CheckCircleIcon /> : <ExpandMoreIcon />}
            </IconButton>
        </Box>
    );
}

function AllServices() {
    const adminId = localStorage.getItem("adminId");
    const [data, setData] = useState<SubAdminData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedPermission, setExpandedPermission] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!adminId) {
                setError("Admin ID not found");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await axios.get(`${sub_admin}/${adminId}`);
                setData(response.data.data);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to fetch data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [adminId]);

    const handleExpandClick = (permissionId: string) => {
        setExpandedPermission(expandedPermission === permissionId ? null : permissionId);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (error || !data) {
        return (
            <Box textAlign="center" py={8}>
                <Typography variant="h6" color="error">
                    {error || "No data available"}
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
            {/* Header Section */}
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    mb: 4,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                }}
            >
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    All Services & Permissions
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Manage and view all assigned services and permissions
                </Typography>
            </Paper>

            {/* User Info Card */}
            <Card elevation={3} sx={{ mb: 4 }}>
                <CardContent>
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Avatar
                                sx={{
                                    width: 80,
                                    height: 80,
                                    bgcolor: 'primary.main',
                                    fontSize: '2rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                {data.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h5" fontWeight="bold">
                                    {data.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {data.email}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Chip
                                        label={data.type}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                    <Chip
                                        label={data.isActive ? "Active" : "Inactive"}
                                        size="small"
                                        color={data.isActive ? "success" : "error"}
                                    />
                                    {data.isHod && (
                                        <Chip
                                            label="HOD"
                                            size="small"
                                            color="secondary"
                                        />
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                            <Typography variant="caption" color="text.secondary">
                                Created At
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                                {new Date(data.createdAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </Typography>
                        </Box>
                        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                            <Typography variant="caption" color="text.secondary">
                                Updated At
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                                {new Date(data.updatedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </Typography>
                        </Box>
                        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                            <Typography variant="caption" color="text.secondary">
                                Total Permissions
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                                {data.permissions?.length || 0}
                            </Typography>
                        </Box>
                        <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
                            <Typography variant="caption" color="text.secondary">
                                Sub-Types
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                                {data.permissions?.reduce((acc, p) => acc + (p.subTypes?.length || 0), 0) || 0}
                            </Typography>
                        </Box>
                        <PasswordField password={data.view || ""} />
                    </Box>
                </CardContent>
            </Card>

            {/* Permissions Section */}
            <Box>
                <Typography variant="h5" fontWeight="bold" mb={3}>
                    📋 Assigned Permissions
                </Typography>

                {data.permissions && data.permissions.length > 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                        {data.permissions.map((permission) => {
                            const isExpanded = expandedPermission === permission._id;
                            const bgColor = colorMap[permission.name] || '#6B7280';

                            return (
                                <Box key={permission._id} sx={{ flex: '1 1 300px', minWidth: '300px', maxWidth: '400px' }}>
                                    <Card
                                        elevation={3}
                                        sx={{
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: 6,
                                            },
                                            border: isExpanded ? `2px solid ${bgColor}` : '2px solid transparent',
                                        }}
                                    >
                                        <CardContent>
                                            {/* Permission Header */}
                                            <Box
                                                onClick={() => handleExpandClick(permission._id)}
                                                sx={{
                                                    cursor: 'pointer',
                                                    display: 'grid',
                                                    gridTemplateColumns: 'auto 1fr auto',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                    minHeight: '100px'
                                                }}
                                            >
                                                <Avatar
                                                    sx={{
                                                        bgcolor: bgColor,
                                                        width: 50,
                                                        height: 50,
                                                    }}
                                                >
                                                    {iconMap[permission.name] || <ExploreIcon />}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="h6" fontWeight="bold">
                                                        {permission.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {permission.subTypes?.length || 0} sub-permissions
                                                    </Typography>
                                                </Box>
                                                <IconButton
                                                    size="small"
                                                    sx={{
                                                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                                                        transition: 'transform 0.3s',
                                                    }}
                                                >
                                                    <ExpandMoreIcon />
                                                </IconButton>
                                            </Box>

                                            {/* Sub-Permissions Collapse */}
                                            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                                <Divider sx={{ my: 2 }} />
                                                <Typography variant="subtitle2" fontWeight="bold" mb={1.5}>
                                                    Sub-Permissions:
                                                </Typography>
                                                {permission.subTypes && permission.subTypes.length > 0 ? (
                                                    <Box sx={{ maxHeight: 250, overflowY: 'auto', pr: 1 }}>
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                            {permission.subTypes.map((subType, index) => (
                                                                <Box
                                                                    key={subType._id}
                                                                    sx={{
                                                                        display: 'grid',
                                                                        gridTemplateColumns: 'auto 1fr',
                                                                        alignItems: 'center',
                                                                        gap: 1.5,
                                                                        p: 1.5,
                                                                        bgcolor: 'grey.50',
                                                                        borderRadius: 2,
                                                                        border: '1px solid',
                                                                        borderColor: 'grey.200',
                                                                        transition: 'all 0.2s',
                                                                        '&:hover': {
                                                                            bgcolor: 'grey.100',
                                                                            borderColor: bgColor,
                                                                        },
                                                                    }}
                                                                >
                                                                    <CheckCircleIcon
                                                                        sx={{ color: bgColor, fontSize: 20 }}
                                                                    />
                                                                    <Box>
                                                                        <Typography variant="body2" fontWeight="medium">
                                                                            {subType.name}
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                            ))}
                                                        </Box>
                                                    </Box>
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                                        No sub-permissions available
                                                    </Typography>
                                                )}
                                            </Collapse>
                                        </CardContent>
                                    </Card>
                                </Box>
                            );
                        })}
                    </Box>
                ) : (
                    <Paper elevation={2} sx={{ p: 6, textAlign: 'center', bgcolor: 'grey.50' }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No permissions assigned
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Contact your administrator to get permissions assigned
                        </Typography>
                    </Paper>
                )}
            </Box>
        </Box >
    );
}

export default AllServices;
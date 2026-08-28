import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import QRCode from "react-qr-code";
import { QRCodeSVG } from "qrcode.react";

import { eventPass_applyPass, digital_pass } from "../../api/config";
import { useParams } from "react-router-dom";
import logo from "../../assets/img/favicon.png";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
    Chip,
    Box,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Typography,
    Card,
    CardContent,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    ListItemIcon,
    Snackbar,
    Alert,
    Pagination,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import EventIcon from "@mui/icons-material/Event";
import PlaceIcon from "@mui/icons-material/Place";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ScheduleIcon from "@mui/icons-material/Schedule";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RepeatIcon from "@mui/icons-material/Repeat";
import PeopleIcon from "@mui/icons-material/People";
import LocalParkingIcon from "@mui/icons-material/LocalParking";

interface UserPass {
    _id: string;
    uniquePassCode: string;
    passId?: string;
    name: string;
    email?: string;
    phoneNumber?: string;
    vehicle?: string;
    photo?: string;
    seats?: string;
    totalSeats?: string;
    menageSeats?: {
        seats: string;
        updatedAt: string;
    };
    dayWiseStore: any[];
    eventId: string;
    formId: string;
    formTitle?: string;
    submittedBy: string;
    recordStatus: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    eventTitle?: string;
    eventDescription?: string;
    eventDate?: string;
    eventTime?: string;
    eventImage?: string;
    eventLocation?: string;
    eventCategory?: string;
    eventCreatedBy?: string;
    responseId?: string;
    eventStartDate?: string | Date;
    eventEndDate?: string | Date;
    eventStartTime?: string;
    eventEndTime?: string;
    eventBgColorCode?: string;
    eventTextColorCode?: string;
    eventAutoApprove?: boolean;
    eventIsMultiEntry?: boolean;
    eventSeatsCount?: number;
    eventVehiclesCount?: number;
    attendUser?: Array<{
        name?: string;
        vehicleNo?: string;
        email?: string;
        phoneNumber?: string;
    }>;
    eventLocationIds?: string[];
    manageSeatsCount?: any;
    managEvehiclesCount?: any;
    address?: string[];
    userStartDate?: string;
    userEndDate?: string;
    userStartTime?: string;
    userEndTime?: string;
    userLocations?: string[];
    userTimeSlots?: Array<{ start: string; end: string }>;
}

interface PaginationInfo {
    totalItems: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
}

const PassPreview: React.FC<{ pass: UserPass }> = ({ pass }) => {
    console.log("🚀 ~ PassPreview ~ pass:===", pass)
    const isActive = pass.status === "active";

    // Background styling
    const bgStyle = pass.eventImage
        ? {
            backgroundImage: `url(${pass.eventImage})`,
        }
        : {
            backgroundColor: pass.eventBgColorCode
                ? `#${pass.eventBgColorCode}`
                : "",
        };

    const textColor = pass.eventTextColorCode
        ? `#${pass.eventTextColorCode}`
        : "#ffffff";

    const formatDate = (date: string | Date | undefined) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // const formatTime = (time: string | undefined) => {
    //     if (!time) return "N/A";
    //     return time;
    // };

    const formatTime = (time: string | undefined) => {
        if (!time || time === "null" || time === "undefined") return "";
        return time;
    };

    // Extract dates and times using user-specific fields
    const startDate = pass.userStartDate || pass.eventStartDate;
    const endDate = pass.userEndDate || pass.eventEndDate;
    const userTimeSlots = pass.userTimeSlots || [];
    const startTime = (pass.userStartTime || "");
    console.log("🚀 ~ PassPreview ~ pass.userStartTime:", pass.userStartTime)
    console.log("🚀 ~ PassPreview ~ startTime:", startTime)
    const endTime = (pass.userEndTime || "");
    console.log("🚀 ~ PassPreview ~ pass.userEndTime:", pass.userEndTime)
    console.log("🚀 ~ PassPreview ~ endTime:", endTime)

    // Handle locations array properly
    const formattedLocations = pass.userLocations ? pass.userLocations.join(", ") : (pass.address ? pass.address.join(", ") : "N/A");
    const formatLocations = (value: string | string[] | null | undefined) => {
        if (!value) return "";

        // Case 1: Already an array
        if (Array.isArray(value)) {
            return value.join(", ");
        }

        // Case 2: JSON string representing array
        try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
                return parsed.join(", ");
            }
        } catch (e) {
            // Not JSON → return as is
            return value;
        }

        return value;
    };

    console.log("🚀 ~ PassPreview ~ pass.photo:", pass.photo)
    return (
        <div
            className="w-[375px] min-h-[667px] p-6 rounded-3xl shadow-2xl flex flex-col items-center relative overflow-hidden bg-cover bg-center bg-white"
            style={bgStyle}
        >
            {/* Decorative elements */}
            {/* <div className="absolute -top-14 -right-14 w-52 h-52 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/10 blur-2xl"></div> */}

            {/* Profile Photo */}
            <div className="mt-16 mb-4 relative z-10">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/30 shadow-xl bg-white">
                    {pass.photo ? (
                        <img
                            src={pass.photo}
                            crossOrigin="anonymous"
                            alt={pass.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <PersonIcon sx={{ fontSize: 48, color: 'gray' }} />
                        </div>
                    )}
                </div>
            </div>

            {/* User Name */}
            <h2
                className="my-2 text-2xl font-bold text-center tracking-wide drop-shadow-md"
                style={{ color: textColor }}
            >
                {pass.eventTitle}
            </h2>

            {/* Pass Title */}
            {/* <h3
                className="mb-4 text-lg font-semibold opacity-90 text-center"
                style={{ color: textColor }}
            >
                {pass.eventTitle} - Visitor Pass
            </h3> */}

            {/* QR Code */}
            <div className="mt-4 mb-5 bg-gray-100 p-5 rounded-2xl shadow-xl flex flex-col items-center relative">
                <div className="relative">
                    <QRCodeSVG
                        value={pass.uniquePassCode}
                        size={180}
                        level="H"
                        includeMargin={true}
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
                        <img src={logo} alt="Logo" className="w-8 h-8" />
                    </div>
                </div>
                {/* <p className="mt-3 text-xs text-gray-600 font-medium">Scan to Verify</p> */}
            </div>

            {/* Pass ID */}
            <div className="bg-black/30 backdrop-blur-md px-6 h-[2rem] rounded-xl mb-4 text-sm font-semibold tracking-wider text-white text-center">
                PassID: {pass.uniquePassCode}
            </div>

            {/* Validity Details */}
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 w-full mb-4 shadow-lg">
                <div
                    className="flex flex-col gap-3 text-sm leading-relaxed"
                    style={{ color: textColor }}
                >
                    <div className="flex justify-between">
                        <span className="opacity-90 font-semibold">Start Date</span>
                        <span className="font-semibold">{formatDate(startDate)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="opacity-90 font-semibold">End Date</span>
                        <span className="font-semibold">{formatDate(endDate)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="opacity-90 font-semibold">Start Time</span>
                        <span className="font-semibold">{startTime}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="opacity-90 font-semibold">End Time</span>
                        <span className="font-semibold">{endTime}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="opacity-90 font-semibold">Locations </span>
                        <span className="font-semibold text-right">{formatLocations(formattedLocations)}</span>
                    </div>
                </div>
            </div>

            <p
                className="mt-4 text-xs opacity-70 text-center"
                style={{ color: textColor }}
            >
                Please show this pass at the entrance
            </p>
        </div>
    );
};

function AllPass() {
    const { eventId } = useParams<{ eventId: string }>();
    const [passes, setPasses] = useState<UserPass[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPass, setSelectedPass] = useState<UserPass | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [paginationInfo, setPaginationInfo] = useState<PaginationInfo | null>(null);
    const [downloadingPass, setDownloadingPass] = useState<UserPass | null>(null);
    const downloadRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!eventId) return;

        const fetchPasses = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `${eventPass_applyPass}/generatedPass/${eventId}?page=${page}&limit=${limit}`
                );

                console.log("All Passes:", response.data);
                setPasses(response.data.data || []);
                setPaginationInfo(response.data.pagination || null);
            } catch (error) {
                console.error("❌ Error fetching passes:", error);
                setPasses([]);
                setPaginationInfo(null);
            } finally {
                setLoading(false);
            }
        };

        fetchPasses();
    }, [eventId, page, limit]);

    const handleViewDetails = (pass: UserPass) => {
        setSelectedPass(pass);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedPass(null);
    };

    const handleDownload = async (pass: UserPass) => {
        setDownloadingPass(pass);
        setTimeout(async () => {
            if (downloadRef.current) {
                try {
                    const canvas = await html2canvas(downloadRef.current, {
                        backgroundColor: null,
                        scale: 2,
                        logging: false,
                        useCORS: true,
                    });
                    const link = document.createElement('a');
                    link.download = `${pass.uniquePassCode}_pass.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                    setSnackbarMessage(`Pass downloaded successfully for ${pass.name}`);
                    setSnackbarOpen(true);
                } catch (error) {
                    console.error("Download error:", error);
                    setSnackbarMessage("Download failed. Please try again.");
                    setSnackbarOpen(true);
                } finally {
                    setDownloadingPass(null);
                }
            }
        }, 100);
    };

    const handleSendEmail = async (pass: UserPass) => {
        try {
            const passLink = `${window.location.origin}/digitalPass/share-pass/${pass._id}`;
            const eventName = pass.eventTitle;
            await axios.post(`${digital_pass}/sendPassLink/email`, {
                email: pass.email,
                eventName,
                passLink
            });
            setSnackbarMessage(`Email sent successfully to ${pass.name}`);
            setSnackbarOpen(true);
        } catch (error) {
            console.error("Email send error:", error);
            setSnackbarMessage("Failed to send email");
            setSnackbarOpen(true);
        }
    };

    const handleSendWhatsApp = async (pass: UserPass) => {
        try {
            const passLink = `${window.location.origin}/digitalPass/share-pass/${pass._id}`;
            const eventName = pass.eventTitle;
            await axios.post(`${digital_pass}/sendPassLink/wp`, {
                phoneNumber: pass.phoneNumber,
                eventName,
                passId: pass._id
            });
            setSnackbarMessage(`WhatsApp message sent successfully to ${pass.name}`);
            setSnackbarOpen(true);
        } catch (error) {
            console.error("WhatsApp send error:", error);
            setSnackbarMessage("Failed to send WhatsApp message");
            setSnackbarOpen(true);
        }
    };

    const handleCopyLink = async (pass: UserPass) => {
        try {
            const linkToCopy = `${window.location.origin}/digitalPass/share-pass/${pass._id}`;
            await navigator.clipboard.writeText(linkToCopy);
            setSnackbarMessage(`Link copied for ${pass.name}`);
            setSnackbarOpen(true);
        } catch (error) {
            console.error("Copy error:", error);
            setSnackbarMessage("Failed to copy link");
            setSnackbarOpen(true);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
        setSnackbarMessage("");
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <Typography>Loading passes...</Typography>
            </Box>
        );
    }

    return (
        <div>
            {/* Hidden Pass Preview for Download */}
            {downloadingPass && (
                <div ref={downloadRef} style={{ position: 'absolute', left: '-9999px', top: 0 }}>
                    <PassPreview pass={downloadingPass} />
                </div>
            )}

            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                All Passes ({paginationInfo?.totalItems || passes.length})
            </Typography>

            {passes.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="textSecondary">No passes found for this event.</Typography>
                </Paper>
            ) : (
                <>
                    <TableContainer component={Paper} sx={{ marginTop: 2, boxShadow: 3 }}>
                        <Table sx={{ minWidth: 650 }} aria-label="passes table">
                            <TableHead sx={{ bgcolor: 'primary.main' }}>
                                <TableRow>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Pass Code</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Photo</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Phone</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {passes.map((pass) => (
                                    <TableRow
                                        key={pass._id}
                                        sx={{
                                            "&:last-child td, &:last-child th": { border: 0 },
                                            "&:hover": { bgcolor: 'action.hover' }
                                        }}
                                    >
                                        <TableCell sx={{ fontWeight: 'medium' }}>{pass.uniquePassCode}</TableCell>
                                        <TableCell>
                                            {pass.photo ? (
                                                <Avatar
                                                    src={pass.photo}
                                                    alt={pass.name}
                                                    sx={{ width: 50, height: 50 }}
                                                />
                                            ) : (
                                                <Avatar sx={{ width: 50, height: 50 }}>
                                                    <PersonIcon />
                                                </Avatar>
                                            )}
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 'medium' }}>{pass.name}</TableCell>
                                        <TableCell>{pass.email || "N/A"}</TableCell>
                                        <TableCell>{pass.phoneNumber || "N/A"}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={pass.status}
                                                color={pass.status === "active" ? "success" : "error"}
                                                size="small"
                                                sx={{ fontWeight: 'medium' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <IconButton
                                                    onClick={() => handleViewDetails(pass)}
                                                    color="primary"
                                                    title="View Details"
                                                    size="small"
                                                >
                                                    <VisibilityIcon />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleDownload(pass)}
                                                    color="secondary"
                                                    title="Download Pass"
                                                    size="small"
                                                >
                                                    <DownloadIcon />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleCopyLink(pass)}
                                                    color="info"
                                                    title="Copy Link"
                                                    size="small"
                                                >
                                                    <ContentCopyIcon />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleSendEmail(pass)}
                                                    color="primary"
                                                    title="Send Email"
                                                    size="small"
                                                >
                                                    <EmailIcon />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => handleSendWhatsApp(pass)}
                                                    color="success"
                                                    title="Send WhatsApp"
                                                    size="small"
                                                >
                                                    <WhatsAppIcon />
                                                </IconButton>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {paginationInfo && paginationInfo.totalPages > 1 && (
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                            <Pagination
                                count={paginationInfo.totalPages}
                                page={page}
                                onChange={handlePageChange}
                                color="primary"
                                size="large"
                            />
                        </Box>
                    )}

                    {/* Details Dialog */}
                    <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", bgcolor: 'primary.main', color: 'white' }}>
                            <Typography variant="h6" fontWeight="bold">
                                <ConfirmationNumberIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                                Pass Details
                            </Typography>
                            <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
                                ✕
                            </IconButton>
                        </DialogTitle>
                        <DialogContent sx={{ mt: 2 }}>
                            {selectedPass && (
                                <Card sx={{ boxShadow: 3 }}>
                                    <CardContent>
                                        {/* User Header */}
                                        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                                            {selectedPass.photo ? (
                                                <Avatar
                                                    src={selectedPass.photo}
                                                    alt={selectedPass.name}
                                                    sx={{ width: 80, height: 80, mr: 2 }}
                                                />
                                            ) : (
                                                <Avatar sx={{ width: 80, height: 80, mr: 2 }}>
                                                    <PersonIcon sx={{ fontSize: 40 }} />
                                                </Avatar>
                                            )}
                                            <Box>
                                                <Typography variant="h5" fontWeight="bold">
                                                    {selectedPass.name}
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary">
                                                    {selectedPass.uniquePassCode} {selectedPass.passId && `| ${selectedPass.passId}`}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Divider sx={{ mb: 2 }} />

                                        {/* User Details Section */}
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 1 }}>
                                            User Details
                                        </Typography>
                                        <List dense sx={{ mb: 2 }}>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <EmailIcon color="action" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary="Email"
                                                    secondary={selectedPass.email || "N/A"}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <PhoneIcon color="action" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary="Phone"
                                                    secondary={selectedPass.phoneNumber || "N/A"}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <DirectionsCarIcon color="action" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary="Vehicle"
                                                    secondary={selectedPass.vehicle || "N/A"}
                                                />
                                            </ListItem>
                                            {selectedPass.attendUser && selectedPass.attendUser.length > 0 && (
                                                <ListItem>
                                                    <ListItemIcon>
                                                        <PeopleIcon color="action" />
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary="Attending Users"
                                                        secondary={selectedPass.attendUser.map(u =>
                                                            `${u.name || u.email || u.phoneNumber || u.vehicleNo || 'N/A'}`
                                                        ).join(', ')}
                                                    />
                                                </ListItem>
                                            )}
                                        </List>

                                        {/* Seat Details Section */}
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 1 }}>
                                            Seat Details
                                        </Typography>
                                        <List dense sx={{ mb: 2 }}>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <EventSeatIcon color="action" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary="Seats"
                                                    secondary={selectedPass.seats || selectedPass.menageSeats?.seats || "N/A"}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <ConfirmationNumberIcon color="action" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary="Total Seats"
                                                    secondary={selectedPass.totalSeats || selectedPass.eventSeatsCount?.toString() || "N/A"}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <LocalParkingIcon color="action" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary="Vehicles Count"
                                                    secondary={selectedPass.eventVehiclesCount?.toString() || "N/A"}
                                                />
                                            </ListItem>
                                        </List>

                                        {/* Pass Configuration Section */}
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 1 }}>
                                            Pass Configuration
                                        </Typography>
                                        <List dense sx={{ mb: 2 }}>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <CalendarTodayIcon color="action" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary="Validity Start"
                                                    secondary={selectedPass.eventStartDate ? new Date(selectedPass.eventStartDate).toLocaleString() : "N/A"}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <ScheduleIcon color="action" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary="Validity End"
                                                    secondary={selectedPass.eventEndDate ? new Date(selectedPass.eventEndDate).toLocaleString() : "N/A"}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    {selectedPass.status === "active" ? (
                                                        <CheckCircleIcon color="success" />
                                                    ) : (
                                                        <ErrorIcon color="error" />
                                                    )}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary="Active"
                                                    secondary={
                                                        <Chip
                                                            label={selectedPass.status === "active" ? "Active" : "Inactive"}
                                                            color={selectedPass.status === "active" ? "success" : "error"}
                                                            size="small"
                                                        />
                                                    }
                                                />
                                            </ListItem>
                                            {selectedPass.eventAutoApprove && (
                                                <ListItem>
                                                    <ListItemIcon>
                                                        <AutoAwesomeIcon color="action" />
                                                    </ListItemIcon>
                                                    <ListItemText primary="Auto Approve" secondary="Enabled" />
                                                </ListItem>
                                            )}
                                            {selectedPass.eventIsMultiEntry && (
                                                <ListItem>
                                                    <ListItemIcon>
                                                        <RepeatIcon color="action" />
                                                    </ListItemIcon>
                                                    <ListItemText primary="Multi Entry" secondary="Enabled" />
                                                </ListItem>
                                            )}
                                        </List>

                                        {/* Event Details Section */}
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 1 }}>
                                            Event Details
                                        </Typography>
                                        <List dense sx={{ mb: 2 }}>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <ConfirmationNumberIcon color="action" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary="Event Title"
                                                    secondary={selectedPass.eventTitle || "N/A"}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <EventIcon color="action" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary="Event Date"
                                                    secondary={selectedPass.eventDate || "N/A"}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <ScheduleIcon color="action" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary="Event Time"
                                                    secondary={selectedPass.eventTime || "N/A"}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <PlaceIcon color="action" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary="Event Location"
                                                    secondary={selectedPass.eventLocation || "N/A"}
                                                />
                                            </ListItem>
                                            {selectedPass.eventImage && (
                                                <ListItem>
                                                    <ListItemAvatar>
                                                        <Avatar
                                                            src={selectedPass.eventImage}
                                                            variant="square"
                                                            sx={{ width: 60, height: 40 }}
                                                        />
                                                    </ListItemAvatar>
                                                    <ListItemText primary="Event Image" secondary="View above" />
                                                </ListItem>
                                            )}
                                        </List>

                                        {/* Form & Record Details Section */}
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 1 }}>
                                            Form & Record Details
                                        </Typography>
                                        <List dense sx={{ mb: 2 }}>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <ConfirmationNumberIcon color="action" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary="Form Title"
                                                    secondary={selectedPass.formTitle || "N/A"}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <CheckCircleIcon color="action" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary="Record Status"
                                                    secondary={selectedPass.recordStatus || "N/A"}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <AccessTimeIcon color="action" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary="Created At"
                                                    secondary={new Date(selectedPass.createdAt).toLocaleString()}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    <AccessTimeIcon color="action" />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary="Updated At"
                                                    secondary={new Date(selectedPass.updatedAt).toLocaleString()}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon>
                                                    {selectedPass.status === "active" ? (
                                                        <CheckCircleIcon color="success" />
                                                    ) : (
                                                        <ErrorIcon color="error" />
                                                    )}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary="Status"
                                                    secondary={
                                                        <Chip
                                                            label={selectedPass.status}
                                                            color={selectedPass.status === "active" ? "success" : "error"}
                                                            size="small"
                                                        />
                                                    }
                                                />
                                            </ListItem>
                                        </List>
                                    </CardContent>
                                </Card>
                            )}
                        </DialogContent>
                    </Dialog>

                    {/* Snackbar for feedback */}
                    <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose}>
                        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: "100%" }}>
                            {snackbarMessage}
                        </Alert>
                    </Snackbar>
                </>
            )}
        </div>
    );
}

export default AllPass;
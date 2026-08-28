import axios from "axios";
import React, { useEffect, useState } from "react";
import { my_dashboard, my_dashboard_all_users } from "../../../api/config";
import Card from "../mydashboardComponent/Card";
import NavButton from "../../../components/button/NavButton";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { IconButton, Dialog } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import GeoPass from "../../../assets/img/geoPass.png";


// Define type for dashboard card
interface DashboardCard {
    _id: string;
    img: string;
    name: string;
    optionType: "nested" | "specific";
    commonlink?: string;
    allowUser?: Array<{ id: string; email?: string; phone?: string }>;
    users?: Array<{ id: string; email?: string; phone?: string; link?: string }>;
    eventDisplay?: boolean;
}

// Define props for Card component
interface CardProps {
    img: string;
    name: string;
    onEdit: () => void;
    onDelete: () => void;
}

const Zero_My_Dashboard_View: React.FC = () => {
    const [cards, setCards] = useState<DashboardCard[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null); // Track deleting card
    const navigate = useNavigate();
    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = GeoPass;
        link.download = "QR.png"; // file name
        link.click();
    };
    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardCards = async () => {
            try {
                setLoading(true);
                const res = await axios.get(my_dashboard);
                console.log("🚀 ~ Zero_My_Dashboard_View ~ res:", res);
                const data = Array.isArray(res.data.data) ? res.data.data : [];
                setCards(data);
                setError(null);
            } catch (error) {
                console.error("Error fetching dashboard:", error);
                setError("Failed to load dashboard cards. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardCards();
    }, []);

    // Delete function with confirmation
    const deleteDashboardCard = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this dashboard card?")) {
            return;
        }

        try {
            setDeletingId(id);
            await axios.delete(`${my_dashboard}/${id}`);
            setCards((prev) => prev.filter((card) => card._id !== id));
            toast.success("Dashboard card deleted successfully!"); // ✅ toast instead of alert
        } catch (error: any) {
            console.error("Error deleting card:", error);

            // Get a proper error message
            const message =
                error.response?.data?.message || // from backend
                error.message ||                  // JS error
                "Failed to delete dashboard card.";

            toast.error(message); // ✅ display error as toast
        } finally {
            setDeletingId(null);
        }

    };
    const adminType = localStorage.getItem("adminType");
    const [open, setOpen] = useState(false);

    return (
        <>
            {adminType === "super admin" && (
                < div className="flex justify-between">
                    <ol className="flex text-gray-500 font-semibold dark:text-white-dark space-x-2">
                        <Link to="/">
                            <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Home</button>
                        </Link>
                        <li>/</li>
                        <li>
                            <button className="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70">
                                My Dashboard
                            </button>
                        </li>
                    </ol>
                    <div style={{ display: "flex", gap: "12px" }}>
                        {/* View Button */}
                        <IconButton
                            color="primary"
                            onClick={() => setOpen(true)}   // ✅ FIXED
                            sx={{
                                backgroundColor: "#E3F2FD",
                                "&:hover": { backgroundColor: "#BBDEFB" }
                            }}
                        >
                            <VisibilityIcon />
                        </IconButton>

                        {/* Download Button */}
                        <IconButton
                            color="success"
                            onClick={handleDownload}
                            sx={{
                                backgroundColor: "#E8F5E9",
                                "&:hover": { backgroundColor: "#C8E6C9" }
                            }}
                        >
                            <DownloadIcon />
                        </IconButton>
                        {/* POPUP WITH IMAGE */}
                        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm">
                            <div
                                style={{
                                    padding: 20,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center"
                                }}
                            >
                                <div
                                    style={{
                                        background: "#fff",
                                        borderRadius: "12px",
                                        boxShadow: "0px 4px 20px rgba(0,0,0,0.15)",
                                        padding: "16px",
                                        textAlign: "center",
                                        width: "100%",
                                        maxWidth: "400px"
                                    }}
                                >
                                    {/* <h3 style={{ marginBottom: "12px", color: "#444" }}>QR</h3> */}

                                    <img
                                        src={GeoPass}
                                        alt="QR"
                                        style={{
                                            width: "100%",
                                            height: "auto",
                                            borderRadius: "10px",
                                            marginBottom: "12px"
                                        }}
                                    />

                                    <button
                                        onClick={() => setOpen(false)}
                                        style={{
                                            padding: "8px 16px",
                                            background: "#007bff",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "8px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </Dialog>

                    </div>
                </div >

            )}
            <ToastContainer />

            <div className="p-6">

                {adminType === "super admin" && (
                    <div className="flex flex-wrap justify-end sm:justify-center md:justify-end gap-3 px-4 pb-8">
                        <NavButton to="/my_dashboard/trigger_notification" className="mb-2 w-full sm:w-auto">
                            Trigger Notification
                        </NavButton>
                        <NavButton to="/my_dashboard/attendanceRecords" className="mb-2 w-full sm:w-auto">
                            Attendance Records
                        </NavButton>
                        <NavButton to="/my_dashboard/supervisorsList" className="mb-2 w-full sm:w-auto">
                            Supervisor
                        </NavButton>
                        <NavButton to="/my_dashboard/location" className="mb-2 w-full sm:w-auto">
                            Location
                        </NavButton>
                        <NavButton to="/my_dashboard/event" className="mb-2 w-full sm:w-auto">
                            Event Type
                        </NavButton>
                        <NavButton to="/my_dashboard/range" className="mb-2 w-full sm:w-auto">
                            Proximity Control
                        </NavButton>
                        <NavButton to="/my_dashboard/add-event" className="mb-2 w-full sm:w-auto">
                            Create New Event
                        </NavButton>
                        <NavButton to="/my_dashboard/form" className="mb-2 w-full sm:w-auto">
                            Create New Card
                        </NavButton>
                    </div>
                )}
                <div className="flex justify-center flex-wrap gap-8 p-4">
                    {cards.map((card) => (
                        <div key={card._id} className="relative">



                            <Card
                                img={card.img}
                                name={card.name}
                                onEdit={() =>
                                    navigate(
                                        card.eventDisplay
                                            ? `edit-event/${card._id}`     // ✅ if eventDisplay is true
                                            : `edit/${card._id}`, // ✅ if false
                                        { state: { id: card._id } }
                                    )
                                }
                                onDelete={() => deleteDashboardCard(card._id)}
                                navigateTo={`/my_dashboard_1/${card._id}`}
                            />

                            {deletingId === card._id && (
                                <p className="text-center text-gray-600 mt-2">Deleting...</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Zero_My_Dashboard_View;
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { event_name } from "../../../../api/config";
import SendIcon from "@mui/icons-material/Send";
import AttendancePage from "../AttendancePage";
import DisplayNotefication from "./DisplayNotefication";

interface EventItem {
    _id: string;
    name: string;
}

interface NotificationData {
    id: number;
    eventId: string;
    eventName: string;
}

const TriggerNotification: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationData[]>([
        { id: 1, eventId: "", eventName: "" },
    ]);
    const [eventList, setEventList] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // -------------------------------------------
    // 1️⃣ Fetch all event names (Auto-select first)
    // -------------------------------------------
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data } = await axios.get(event_name);

                if (data?.success && Array.isArray(data.events)) {
                    const events = data.events;
                    setEventList(events);

                    // Auto-select first
                    if (events.length > 0) {
                        setNotifications([
                            {
                                id: 1,
                                eventId: events[0]._id,
                                eventName: events[0].name,
                            },
                        ]);
                    }
                }
            } catch (error) {
                console.error("❌ Error fetching event names:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    // -------------------------------------------
    // 2️⃣ User changes event selection
    // -------------------------------------------
    const handleEventSelect = (id: number, selectedId: string) => {
        const selectedEvent = eventList.find((e) => e._id === selectedId);

        console.log("🚀 Selected Event:", selectedEvent);

        setNotifications((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        eventId: selectedEvent?._id || "",
                        eventName: selectedEvent?.name || "",
                    }
                    : item
            )
        );
    };

    // -------------------------------------------
    // 3️⃣ Trigger notification button
    // -------------------------------------------
    const handleTrigger = (item: NotificationData) => {
        if (!item.eventId || !item.eventName) {
            alert("Please select an event before proceeding!");
            return;
        }

        console.log("🔔 Trigger Notification for Event:", item.eventName);

        navigate(`/my_dashboard/reminder_notefication/${item.eventId}`, {
            state: {
                eventId: item.eventId,
                eventName: item.eventName,
            },
        });
    };

    // Selected event
    const selectedEvent = notifications[0];

    if (loading) {
        return (
            <div className="flex justify-center items-center mt-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    const adminType = localStorage.getItem("adminType");

    return (
        <>
            {adminType === "super admin" && (
                <ol className="flex text-gray-500 font-semibold dark:text-white-dark space-x-2">
                    <Link to="/">
                        <button className="hover:text-gray-500/70">Home</button>
                    </Link>
                    <li>/</li>
                    <Link to="/my_dashboard">
                        <button className="hover:text-gray-500/70"> My Dashboard</button>
                    </Link>
                    <li>/</li>
                    <li>
                        <button className="text-black dark:text-white-light">
                            Trigger Notification
                        </button>
                    </li>
                </ol>
            )}

            <div className="p-5 bg-gray-50 min-h-screen">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Trigger Notification</h1>

                <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Event Name</th>
                                <th className="px-6 py-3 text-center">Action</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                            {notifications.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4">
                                        <select
                                            value={item.eventId}
                                            onChange={(e) =>
                                                handleEventSelect(item.id, e.target.value)
                                            }
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                                        >
                                            {eventList.map((event) => (
                                                <option key={event._id} value={event._id}>
                                                    {event.name}
                                                </option>
                                            ))}
                                        </select>
                                    </td>

                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleTrigger(item)}
                                            className="inline-flex items-center px-3 py-2 text-sm rounded-md 
                                            text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                        >
                                            <SendIcon className="mr-2" />
                                            Send
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* PASS SELECTED EVENT ID HERE */}
                <DisplayNotefication eventId={selectedEvent?.eventId} />


            </div>
        </>
    );
};

export default TriggerNotification;

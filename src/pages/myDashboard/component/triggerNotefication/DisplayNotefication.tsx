
import React, { useEffect, useState } from "react";
import axios from "axios";
import { EVENT } from "../../../../api/config";

interface DisplayNoteficationProps {
    eventId: string;
}

interface NotificationItem {
    _id: string;
    title: string;
    body: string;
    link: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    createdAt: string;
}

const DisplayNotefication: React.FC<DisplayNoteficationProps> = ({ eventId }) => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!eventId) return;

        const fetchNotifications = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`${EVENT}/get_TriggerNotification`, {
                    params: { eventId },
                });

                if (data.success) {
                    setNotifications(data.data);
                }
            } catch (err) {
                console.error("❌ Error fetching notifications:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [eventId]);

    const handleLinkClick = (link: string) => {
        window.open(link, '_blank', 'noopener,noreferrer');
    };

    if (!eventId) {
        return <p className="text-gray-500">Select an event to view notifications.</p>;
    }

    if (loading) {
        return <p className="text-gray-600">Loading notifications...</p>;
    }

    return (
        <div className="bg-white shadow-lg rounded-lg p-5 mb-10">
            <h2 className="text-xl font-semibold mb-4">Sent Notifications</h2>

            {notifications.length === 0 ? (
                <p className="text-gray-500">No notifications found for this event.</p>
            ) : (
                <table className="min-w-full divide-y divide-gray-200 border">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                                Title
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                                Body
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                                Start
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                                End
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                                Created At
                            </th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                                Link
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                        {notifications.map((n) => (
                            <tr key={n._id} className="hover:bg-gray-50">
                                <td className="px-4 py-2">{n.title}</td>
                                <td className="px-4 py-2">{n.body}</td>
                                <td className="px-4 py-2">
                                    {n.startDate} <br />
                                    <span className="text-xs text-gray-500">{n.startTime}</span>
                                </td>
                                <td className="px-4 py-2">
                                    {n.endDate} <br />
                                    <span className="text-xs text-gray-500">{n.endTime}</span>
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-500">
                                    {new Date(n.createdAt).toLocaleString()}
                                </td>
                                <td className="px-4 py-2">
                                    {n.link ? (
                                        <button
                                            onClick={() => handleLinkClick(n.link)}
                                            className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                                            title="Open link in new tab"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-4 w-4 mr-1"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                />
                                            </svg>
                                            Visit
                                        </button>
                                    ) : (
                                        <span className="text-gray-400 text-sm">No link</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default DisplayNotefication;
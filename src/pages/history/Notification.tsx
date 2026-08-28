import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { display_all_notification } from '../../api/config';
import { Link } from 'react-router-dom';

interface Notification {
    _id: string;
    title: string;
    body: string;
    NotificationTime: string;
    NotificationTimeIST: string;
    // Other properties you might need
    sent?: boolean;
    deviceTokens?: string[];
}

function Notification() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await axios.get(display_all_notification);

                // Check if response.data exists and has the expected structure
                if (response.data && Array.isArray(response.data.data)) {
                    setNotifications(response.data.data);
                } else if (Array.isArray(response.data)) {
                    // Handle case where data is directly in response.data
                    setNotifications(response.data);
                } else {
                    setError('Invalid data format received from server');
                }
            } catch (err) {
                console.error('Error fetching notifications:', err);
                setError(axios.isAxiosError(err) ? err.response?.data?.message || err.message : 'Failed to fetch notifications');
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    // Function to extract date and time from NotificationTimeIST
    const formatNotificationTime = (istTime: string) => {
        if (!istTime) return { date: '', time: '' };
        
        const parts = istTime.split(' ');
        if (parts.length >= 2) {
            return {
                date: parts[0], // "03-06-2025"
                time: parts[1]  // "09:32:37"
            };
        }
        return {
            date: istTime,
            time: ''
        };
    };

    return (
        <>
                      <ol className="flex text-gray-500 font-semibold dark:text-white-dark space-x-2">
              <Link to="/">
                                    <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70"
                                    
                                    >Home</button>
                                </Link>
                <li>/</li>
              <Link to="/history">
                                    <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70"
                                    
                                    >History</button>
                                </Link>
                <li>/</li>
                <li>
                    <button className="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70">Notifications
</button>
                </li>
               
            </ol>
             <div className="p-4">
            <h2 className="text-2xl font-semibold mb-4">Notifications</h2>

            {loading && (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

            {!loading && !error && (
                <>
                    {notifications.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto border-collapse border">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-3 border-b text-left">Title</th>
                                        <th className="p-3 border-b text-left">Message</th>
                                        <th className="p-3 border-b text-left">Date</th>
                                        <th className="p-3 border-b text-left">Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {notifications.map((notification) => {
                                        const { date, time } = formatNotificationTime(notification.NotificationTimeIST);
                                        return (
                                            <tr key={notification._id} className="hover:bg-gray-50">
                                                <td className="p-3 border-b">{notification.title}</td>
                                                <td className="p-3 border-b">{notification.body}</td>
                                                <td className="p-3 border-b">{date}</td>
                                                <td className="p-3 border-b">{time}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">No notifications available</div>
                    )}
                </>
            )}
        </div>
             </>
    );
}

export default Notification;
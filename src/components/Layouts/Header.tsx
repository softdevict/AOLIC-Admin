import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { IRootState } from '../../store';
import { toggleSidebar } from '../../store/themeConfigSlice';
import MenuIcon from '@mui/icons-material/Menu';
import logo from '../../../public/assets/logo/AOL LOGO BANGALORE ASHRAM BLACK.png';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { display_all_notification } from '../../api/config';
import GlobalSearch from '../search/GlobalSearch';
import LogoutIcon from '@mui/icons-material/Logout';
import { logout } from '../../store/authSlice';
import moment from 'moment';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { toast } from 'react-toastify';

interface NotificationType {
    title?: string;
    body?: string;
    dateTime?: string;
    [key: string]: any;
}

const Header = () => {
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationType[]>([]);
    // console.log("🚀 ~ Header ~ notifications:", notifications)
    const [loading, setLoading] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const dispatch = useDispatch();
    const notifySuccess = (msg: string) => toast.success(msg);
    const handleLogout = () => {
        const confirmDelete = window.confirm('Are you sure you want to LogOut ?');
        if (!confirmDelete) return;
        localStorage.clear();
        sessionStorage.clear();
        document.cookie.split(';').forEach((c) => {
            document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
        });
        dispatch(logout());
        notifySuccess('Logout successfully!');
        setTimeout(() => {
            navigate('/signin');
        }, 1000); // 3 minutes = 180000 ms
    };

    useEffect(() => {
        const fetchNotifications = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            setLoading(true);
            try {
                const response = await axios.get(display_all_notification, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                // console.log("🚀 ~ fetchNotifications ~ response:", response)

                const formattedNotifications = response.data.map((notification: NotificationType) => {
                    const dateTime = new Date(notification.createdAt); // ISO string
                    const now = new Date();
                    let formattedDate = '';

                    // Check if it's today
                    if (dateTime.toDateString() === now.toDateString()) {
                        formattedDate = dateTime.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                        });
                    }
                    // Check if within the last 7 days
                    else if (dateTime > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
                        // use moment fromNow directly on the ISO string
                        formattedDate = moment(notification.createdAt).fromNow();
                    }
                    // Otherwise, show full date
                    else {
                        formattedDate = dateTime.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        });
                    }

                    const n = { ...notification, formattedDate };
                    // console.log(n, 'formattedDate');
                    return n;
                });

                setNotifications(formattedNotifications);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [notificationOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setNotificationOpen(false);
            }
        };
        if (notificationOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [notificationOpen]);

    return (
        <header className={`z-40 ${themeConfig.semidark && themeConfig.menu === 'horizontal' ? 'dark' : ''}`}>
            <div className="shadow-sm bg-white ">
                <div className="relative flex lg:justify-between w-full items-center px-5 py-2.5 dark:bg-black ">
                    <div className="w-[33%] ">
                        <button
                            type="button"
                            className="m-auto collapse-icon flex-none dark:text-[#d0d2d6] hover:text-primary dark:hover:text-primary flex lg:hidden ltr:ml-2 rtl:mr-2 p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:bg-white-light/90 dark:hover:bg-dark/60"
                            onClick={
                                () => dispatch(toggleSidebar())
                                // console.log("hello")
                            }
                            aria-label="Toggle sidebar"
                        >
                            <MenuIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="ml-4 lg:w-[33%] w-[60%] m-auto horizontal-logo flex lg:hidden justify-center items-center ">
                        <Link to="/" className="main-logo flex items-center shrink-0">
                            <img className="w-32 inline" src={logo} alt="logo" loading="lazy" />
                        </Link>
                    </div>

                    <div className="w-[33%] flex justify-center items-center relative ">
                        <div className="flex-1">
                            <GlobalSearch />
                        </div>
                        <div
                            className="w-10 h-10 flex items-center justify-center cursor-pointer relative hover:bg-[#ed9e4343] rounded-full"
                            onClick={() => setNotificationOpen(!notificationOpen)}
                            aria-label="Notifications"
                            role="button"
                        >
                            <NotificationsNoneIcon className="text-orange-500" />
                            {/* <NotificationsIcon className="text-orange-500" /> */}
                            {notifications.length > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5  rounded-full border border-white" />}
                        </div>

                        {notificationOpen && (
                            <div
                                ref={notificationRef}
                                className="absolute top-14 right-0 bg-white dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-4 w-80 max-h-96 overflow-y-auto z-[33]"
                            >
                                <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Notifications</h4>
                                {loading ? (
                                    <p className="text-gray-600 dark:text-white">Loading...</p>
                                ) : notifications.length > 0 ? (
                                    <ul className="space-y-2">
                                        {notifications.map((note, idx) => (
                                            <li key={idx} className="text-sm text-gray-700 dark:text-white border-b pb-4 p-4 rounded-md bg-[#e5e4e483]">
                                                <strong>{note.title || 'Untitled'}</strong>
                                                <div>{note.body || 'No content'}</div>
                                                <div className="w-full flex flex-row-reverse text-xs text-gray-500">{note.formattedDate || 'No time'}</div>
                                                {note.link && note.link !== "" ?
                                                    <Link to={note.link} className="text-[#e29837] bg-[#dadada76] border bottom-2 p-2 rounded-lg  hover:text-[#9f4e2d] font-medium border-white mt-4">Click Here</Link>
                                                    :
                                                    <></>
                                                }

                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-600 dark:text-white">No new notifications</p>
                                )}
                            </div>
                        )}

                        <button onClick={handleLogout} className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors" aria-label="Logout">
                            <LogoutIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

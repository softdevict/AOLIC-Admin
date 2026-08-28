import axios from 'axios';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import Button from '../../../../components/button/Button';
import { ToastContainer, toast } from 'react-toastify';
import CloseIcon from '@mui/icons-material/Close';
import { send_Reminder_Notification, my_dashboard_user_card_details } from '../../../../api/config';
import 'react-toastify/dist/ReactToastify.css';

type FormData = {
    title: string;
    body: string;
    link?: string;
    startDate: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
};

const ReminderNotefication = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { eventId } = useParams<{ eventId: string }>();
    const eventName = location.state?.eventName;

    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm<FormData>({
        defaultValues: {
            title: '',
            body: '',
            link: '',
            startDate: '', // initially empty
            endDate: '',   // initially empty
            startTime: '',
            endTime: '',
        },
    });

    const notify = (msg: string) =>
        toast.success(msg, {
            position: 'top-right',
            autoClose: 3000,
        });

    // ✅ Fetch event details and set Start & End Dates from API
    useEffect(() => {
        if (!eventId) return;

        axios
            .get(`${my_dashboard_user_card_details}/${eventId}`)
            .then((response) => {
                // ✅ Actual event data is nested inside .data.data
                const eventData = response.data?.data || response.data;
                console.log("✅ Event Data (fixed):", eventData);

                // ✅ Ensure these are properly formatted for <input type="date">
                const formattedStart = eventData?.startDate
                    ? eventData.startDate.split("T")[0]
                    : "";
                const formattedEnd = eventData?.endDate
                    ? eventData.endDate.split("T")[0]
                    : "";

                // ✅ Reset the form with new values
                reset({
                    title: "",
                    body: "",
                    link: "",
                    startDate: formattedStart,
                    endDate: formattedEnd,
                    startTime: "",
                    endTime: "",
                });
            })
            .catch((error) => {
                console.error("❌ Error fetching event data:", error);
            });
    }, [eventId, reset]);


    const onSubmit: SubmitHandler<FormData> = async (data) => {
        if (!eventId) {
            toast.error('Event ID is missing in route.');
            return;
        }

        try {
            setLoading(true);

            const payload = {
                eventId,
                title: data.title,
                body: data.body,
                link: data.link,
                startDate: data.startDate,
                endDate: data.endDate,
                startTime: data.startTime,
                endTime: data.endTime,
            };

            console.log('🚀 Sending Reminder Notification:', payload);

            const response = await axios.post(send_Reminder_Notification, payload);

            if (response.data?.success) {
                notify('Reminder Notification Sent Successfully!');
                navigate('/my_dashboard/trigger_notification');
            } else {
                toast.warning('Notification sent but not confirmed.');
            }

            reset();
        } catch (error: any) {
            console.error('❌ Error sending notification:', error);
            toast.error(error.response?.data?.message || 'Error sending notification');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ToastContainer />
            {/* Breadcrumb */}
            <ol className="flex space-x-2 text-gray-500 font-semibold dark:text-white-dark">
                <li>
                    <Link to="/" className="hover:text-gray-500/70 dark:hover:text-white-dark/70">
                        Home
                    </Link>
                </li>
                <li>/</li>
                <li>
                    <Link to="/my_dashboard" className="hover:text-gray-500/70 dark:hover:text-white-dark/70">
                        My Dashboard
                    </Link>
                </li>
                <li>/</li>
                <li>
                    <Link to="/my_dashboard/trigger_notification" className="hover:text-gray-500/70 dark:hover:text-white-dark/70">
                        Trigger Notification
                    </Link>
                </li>
                <li>/</li>
                <li className="text-black dark:text-white-light">Reminder Notification</li>
            </ol>

            {/* Main Container */}
            <div
                className="relative w-full flex justify-center items-center flex-col bg-white sm:w-[35rem] m-auto rounded-2xl shadow-2xl mt-8"
                style={{
                    borderRadius: '8px',
                    boxShadow: 'rgba(97, 75, 66, 0.5) 2px 2px 8px 0px',
                }}
            >
                <div
                    className="absolute top-3 right-3 hover:bg-gray-300 rounded-xl cursor-pointer"
                    onClick={() => navigate('/my_dashboard/triger_notefication')}
                >
                    <CloseIcon />
                </div>

                <h2 className="text-2xl font-bold mt-6 mb-2 font-cinzel">
                    Reminder Notification
                </h2>

                {eventName && (
                    <p className="text-sm mb-1 text-gray-600">
                        <span className="font-semibold">{eventName}</span>
                    </p>
                )}

                {/* Form */}
                <form
                    className="flex flex-col p-4 gap-3 w-full m-auto mb-5"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    {/* Title */}
                    <label className="font-semibold mt-2">Title</label>
                    <input
                        type="text"
                        placeholder="Notification Title"
                        className="p-3 border-2 focus:outline-none rounded-lg"
                        {...register('title', {
                            required: 'Title is required',
                            minLength: { value: 3, message: 'Minimum 3 characters' },
                        })}
                    />
                    {errors.title && <span className="text-red-500">{errors.title.message}</span>}

                    {/* Body */}
                    <label className="font-semibold mt-2">Body</label>
                    <textarea
                        placeholder="Notification Message"
                        className="p-3 border-2 focus:outline-none rounded-lg h-28 resize-none"
                        {...register('body', {
                            required: 'Body is required',
                            minLength: { value: 5, message: 'Minimum 5 characters' },
                        })}
                    />
                    {errors.body && <span className="text-red-500">{errors.body.message}</span>}

                    {/* Link */}
                    <label className="font-semibold mt-2">Link</label>
                    <input
                        type="url"
                        placeholder="https://yourwebsite.com/event/123"
                        className="p-3 border-2 focus:outline-none rounded-lg"
                        {...register('link', {
                            pattern: {
                                value: /^(https?:\/\/[^\s$.?#].[^\s]*)$/,
                                message: 'Please enter a valid URL',
                            },
                        })}
                    />
                    {errors.link && <span className="text-red-500">{errors.link.message}</span>}

                    {/* ✅ Start Date */}
                    <label className="font-semibold mt-2">
                        Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        className="p-3 border-2 rounded-lg"
                        {...register('startDate', { required: 'Start date is required' })}
                    />
                    {errors.startDate && <span className="text-red-500">{errors.startDate.message}</span>}

                    {/* ✅ End Date */}
                    <label className="font-semibold mt-2">End Date</label>
                    <input
                        type="date"
                        className="p-3 border-2 rounded-lg"
                        {...register('endDate')}
                    />

                    {/* Start Time */}
                    <label className="font-semibold mt-2">
                        Morning Time <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="time"
                        className="p-3 border-2 rounded-lg"
                        {...register('startTime', { required: 'Morning time is required' })}
                    />
                    {errors.startTime && <span className="text-red-500">{errors.startTime.message}</span>}

                    {/* End Time */}
                    <label className="font-semibold mt-2">
                        Evening Time <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="time"
                        className="p-3 border-2 rounded-lg"
                        {...register('endTime', { required: 'Evening time is required' })}
                    />
                    {errors.endTime && <span className="text-red-500">{errors.endTime.message}</span>}

                    <Button text={loading ? 'Sending...' : 'Submit'} loading={loading} />
                </form>
            </div>
        </>
    );
};

export default ReminderNotefication;

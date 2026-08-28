import { useForm, SubmitHandler } from 'react-hook-form';
import Button from '../../components/button/Button';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { add_Live_link, display_Live_link, remove_Live_link } from '../../api/config';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Define types
interface FormValues {
    link: string;
    liveTime?: string; // Made optional
}

interface LiveLink {
    _id: string;
    link: string;
    liveTime?: string; // Made optional
    active: boolean;
}

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
    message: string;
}

const LiveLinkForm: React.FC = () => {
    const navigate = useNavigate();
    const [live, setLive] = useState<LiveLink[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [stopLoading, setStopLoading] = useState<boolean>(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>();

    const fetchLiveLinks = async () => {
        try {
            const response = await axios.get<{ data: LiveLink[] }>(display_Live_link);
            setLive(response.data.data || []);
        } catch (error) {
            console.error('Error fetching live links:', error);
            toast.error('Failed to fetch live links');
        }
    };

    useEffect(() => {
        fetchLiveLinks();
    }, []);

    const notify = (msg: string) => toast.success(msg);
    const errorNotify = (msg: string) => toast.error(msg);

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        try {
            setLoading(true);

            const payload: { link: string; liveTime?: string } = {
                link: data.link,
            };

            if (data.liveTime) {
                const liveTimeLocal = new Date(data.liveTime);
                payload.liveTime = liveTimeLocal.toISOString();

                const now = new Date();
                if (liveTimeLocal <= now) {
                    throw new Error('If provided, live time must be in the future');
                }
            }

            await axios.post(add_Live_link, payload);
            notify(data.liveTime ? 'Live link scheduled successfully!' : 'Live link added successfully!');
            fetchLiveLinks();
            setTimeout(() => navigate('/'), 1000);
        } catch (error) {
            const err = error as ApiError;
            errorNotify(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    const stopLive = async () => {
        try {
            setStopLoading(true);
            await axios.delete(remove_Live_link);
            notify('Live link stopped successfully!');
            fetchLiveLinks();
            setTimeout(() => navigate('/'), 1000);
        } catch (error) {
            const err = error as ApiError;
            console.error('Error stopping live link:', err);
            errorNotify(err.response?.data?.message || 'Failed to stop live link');
        } finally {
            setStopLoading(false);
        }
    };
    const adminType = localStorage.getItem("adminType");
    return (
        <>
            {adminType === "super admin" && (
                <ol className="flex space-x-2 text-gray-500 font-semibold dark:text-white-dark">
                    <li>
                        <Link to="/" className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Home</Link>
                    </li>
                    <li>/</li>
                    <li className="text-black dark:text-white-light">Live Link</li>
                </ol>
            )}
            <div>
                <ToastContainer />
                {live.length === 0 ? (
                    <div
                        className="w-full flex justify-center items-center flex-col bg-white sm:w-[35rem] m-auto rounded-2xl shadow-2xl mt-8"
                        style={{
                            borderRadius: '4px',
                            boxShadow: 'rgba(97, 75, 66, 0.7) 2px 2px 5px 0px',
                        }}
                    >
                        <h2 className="text-2xl font-bold m-8 font-cinzel">Add Live Link</h2>
                        <form className="flex flex-col p-4 gap-2 w-full m-auto mb-5" onSubmit={handleSubmit(onSubmit)}>
                            <input
                                className="p-4 border-2 focus:outline-none rounded-lg w-full"
                                type="text"
                                placeholder="Live Link (https://...)"
                                {...register('link', {
                                    required: 'Link is required',
                                    pattern: {
                                        value: /^https:\/\//,
                                        message: 'Please enter a valid URL (starting with https://)',
                                    },
                                })}
                            />
                            {errors.link && <span className="text-red-500">{errors.link.message}</span>}

                            <input
                                className="p-4 border-2 focus:outline-none rounded-lg w-full"
                                type="datetime-local"
                                placeholder="Live Time (optional)"
                                {...register('liveTime', {
                                    validate: (value) => !value || new Date(value) > new Date() || 'If provided, time must be in the future',
                                })}
                            />
                            {errors.liveTime && <span className="text-red-500">{errors.liveTime.message}</span>}

                            <Button text="Submit" loading={loading} />
                        </form>
                    </div>
                ) : (
                    <div
                        className="w-full flex justify-center items-center flex-col bg-white sm:w-[35rem] m-auto rounded-2xl shadow-2xl mt-8 p-8"
                        style={{
                            borderRadius: '4px',
                            boxShadow: 'rgba(97, 75, 66, 0.7) 2px 2px 5px 0px',
                        }}
                    >
                        <h2 className="text-2xl font-bold font-cinzel mb-4">Live is Running</h2>
                        <p className="text-blue-600 font-medium mb-2">{live[0]?.link || 'No link available'}</p>
                        <p className="text-gray-600 mb-4">
                            {live[0]?.liveTime ? (
                                `Scheduled for: ${new Intl.DateTimeFormat('en-IN', {
                                    timeZone: 'Asia/Kolkata',
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                }).format(new Date(live[0].liveTime))}`
                            ) : (
                                'No scheduled time'
                            )}
                        </p>
                        <button
                            onClick={stopLive}
                            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition-all"
                            disabled={stopLoading}
                        >
                            {stopLoading ? 'Stopping...' : 'Stop Live'}
                        </button>

                    </div>
                )}
            </div>
        </>

    );
};

export default LiveLinkForm;
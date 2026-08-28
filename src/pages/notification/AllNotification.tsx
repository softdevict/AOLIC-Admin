import axios from 'axios';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/button/Button';
import { push_Notification } from '../../api/config';
import { ToastContainer, toast } from 'react-toastify';

type FormData = {
    title: string;
    body: string;
    link: string;
    NotificationTime?: string;
};

const NotificationAll = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormData>({
        defaultValues: {
            title: '',
            body: '',
            link: '',
            NotificationTime: '',
        },
    });

    const notify = (msg: string) =>
        toast.success(msg, {
            position: 'top-right',
            autoClose: 3000,
        });

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        setLoading(true);
        setError(null);

        if (data.NotificationTime) {
            const notificationDate = new Date(data.NotificationTime);
            const now = new Date();

            if (notificationDate < now) {
                setError('Notification time must be in the future.');
                setLoading(false);
                return;
            }
        }

        try {
            const payload = {
                title: data.title.trim(),
                body: data.body.trim(),
                link: data.link.trim(),
                NotificationTime: data.NotificationTime
                    ? new Date(data.NotificationTime).toISOString()
                    : null,
            };

            await axios.post(push_Notification, payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            });

            reset();
            notify('Notification sent successfully!');
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'Failed to send notification. Please try again.';
            setError(errorMessage);
            console.error('Notification sending failed:', err);
        } finally {
            setLoading(false);
        }
    };
    const adminType = localStorage.getItem("adminType");
    return (
        <>
            {adminType === "super admin" && (
                <ol className="flex space-x-2 text-gray-500 font-semibold dark:text-white-dark">
                    <li>
                        <Link to="/" className="hover:text-gray-500/70 dark:hover:text-white-dark/70">
                            Home
                        </Link>
                    </li>
                    <li>/</li>
                    <li className="text-black dark:text-white-light">Send All Notification</li>
                </ol>
            )}
            <div
                className="w-full flex justify-center items-center flex-col bg-white sm:w-[35rem] m-auto rounded-2xl shadow-2xl mt-8"
                style={{
                    borderRadius: '4px',
                    boxShadow: 'rgba(97, 75, 66, 0.7) 2px 2px 5px 0px',
                }}
            >
                <ToastContainer />
                <h2 className="text-2xl font-bold m-8 font-cinzel">Send All Notification</h2>

                <form
                    className="flex flex-col p-4 gap-2 w-full m-auto mb-5"
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <input
                        type="text"
                        placeholder="Title"
                        className="p-4 border-2 focus:outline-none rounded-lg"
                        {...register('title', {
                            required: 'Title is required',
                            minLength: { value: 3, message: 'Title must be at least 3 characters' },
                        })}
                    />
                    {errors.title && <span className="text-red-500">{errors.title.message}</span>}

                    <textarea
                        placeholder="Body"
                        className="p-4 border-2 focus:outline-none rounded-lg h-32 resize-none"
                        {...register('body', {
                            required: 'Body is required',
                            minLength: { value: 3, message: 'Body must be at least 3 characters' },
                        })}
                    />
                    {errors.body && <span className="text-red-500">{errors.body.message}</span>}

                    <input
                        type="text"
                        placeholder="Link"
                        className="p-4 border-2 focus:outline-none rounded-lg"
                        {...register('link', {
                            minLength: { value: 3, message: 'Link must be at least 3 characters' },
                            pattern: {
                                value: /^(https?:\/\/)?([\w-]+?\.)+[\w-]+(\/[\w-./?%&=]*)?$/,
                                message: 'Please enter a valid URL',
                            },
                        })}
                    />
                    {errors.link && <span className="text-red-500">{errors.link.message}</span>}

                    <input
                        type="datetime-local"
                        className="p-4 border-2 focus:outline-none rounded-lg w-full"
                        {...register('NotificationTime')}
                    />

                    {error && <p className="text-red-500 text-center">{error}</p>}

                    <Button text={loading ? 'Sending...' : 'Submit'} loading={loading} />
                </form>
            </div>
        </>
    );
};

export default NotificationAll;

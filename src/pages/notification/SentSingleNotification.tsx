import axios from 'axios';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/button/Button';
import { push_Notification_single } from '../../api/config';
import { ToastContainer, toast } from 'react-toastify';
import CloseIcon from '@mui/icons-material/Close';

type FormData = {
    title: string;
    body: string;
    link: string;
    img: FileList;
    NotificationTime?: string;
};

const SentSingleNotificaton = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const selectedIds = location.state?.selectedIds as string[] | undefined;

    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        setLoading(true);
        setError(null);

        // Validate notification time
        if (data.NotificationTime) {
            const notificationDate = new Date(data.NotificationTime);
            if (notificationDate < new Date()) {
                setError('Notification time must be in the future.');
                setLoading(false);
                return;
            }
        }

        try {
            const formData = new FormData();
            formData.append('title', data.title.trim());
            formData.append('body', data.body.trim());
            formData.append('link', data.link.trim());
            if (data.NotificationTime) {
                formData.append('NotificationTime', new Date(data.NotificationTime).toISOString());
            }
            if (data.img && data.img[0]) {
                formData.append('img', data.img[0]);
            }
            formData.append('selectedIds', JSON.stringify(selectedIds || []));

            const response = await axios.post(push_Notification_single, formData, {
                // ✅ Increase timeout to 60 seconds
                timeout: 60000,
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / (progressEvent.total || 1)
                    );
                    console.log(`Upload progress: ${percentCompleted}%`);
                },
            });

            // Notify success
            reset();
            setImagePreview(null);
            notify('Notification sent successfully!');
            setTimeout(() => navigate('/displaya_all_user'), 1500);

        } catch (err: any) {
            let errorMessage = 'Failed to send notification. Please try again.';

            if (axios.isAxiosError(err)) {
                if (err.code === 'ECONNABORTED') {
                    errorMessage = 'Request timed out. Please try again.';
                } else if (err.message === 'Network Error') {
                    errorMessage = 'Network error. Check your connection.';
                }
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }

            setError(errorMessage);
            console.error('Notification sending failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ol className="flex space-x-2 text-gray-500 font-semibold dark:text-white-dark">
                <li>
                    <Link to="/" className="hover:text-gray-500/70 dark:hover:text-white-dark/70">
                        Home
                    </Link>
                </li>
                <li>/</li>
                <li>
                    <Link to="/notification/single" className="hover:text-gray-500/70 dark:hover:text-white-dark/70">
                        User
                    </Link>
                </li>
                <li>/</li>
                <li className="text-black dark:text-white-light">Send Notification</li>
            </ol>

            <div
                className="relative w-full flex justify-center items-center flex-col bg-white sm:w-[35rem] m-auto rounded-2xl shadow-2xl mt-8"
                style={{
                    borderRadius: '4px',
                    boxShadow: 'rgba(97, 75, 66, 0.7) 2px 2px 5px 0px',
                }}
            >
                <div className='absolute top-3 right-3 hover:bg-gray-300 rounded-xl  ' onClick={() => {
                    navigate("/notification/single")
                }}>
                    <CloseIcon />
                </div>
                <ToastContainer />
                <h2 className="text-2xl font-bold m-8 font-cinzel">Send Notification</h2>

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
                    {/* <label className="bg-black-light rounded-lg">
                        <input className="p-3 focus:outline-none rounded-lg" type="file" {...register('img')} onChange={handleImageChange} />
                    </label>
                    {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-48 h-48 object-cover rounded-lg border" />} */}
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

export default SentSingleNotificaton;

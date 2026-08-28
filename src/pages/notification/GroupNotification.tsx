import axios from 'axios';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/button/Button';
import { push_group_notification, sendNoteficationCityIntrest } from '../../api/config';
import { ToastContainer, toast } from 'react-toastify';
import CloseIcon from '@mui/icons-material/Close';

type FormData = {
    title: string;
    body: string;
    link: string;
    NotificationTime?: string;
};

const NotificationGroup = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const GroupName = location?.state?.groupName;
    const groupType = location?.state?.type;

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormData>();

    const notify = (msg: string) => toast.success(msg);

    const apiUrl = groupType === 'regular' ? push_group_notification : sendNoteficationCityIntrest;

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        setLoading(true);
        setError(null);

        if (data.NotificationTime) {
            const notificationDate = new Date(data.NotificationTime);
            const now = new Date();

            // Block past time selection
            if (notificationDate < now) {
                setError('Notification time must be in the future.');
                setLoading(false);
                return;
            }
        }

        try {
            await axios.post(apiUrl, {
                title: data.title,
                body: data.body,
                link:data.link,
                groupName: GroupName,
                NotificationTime: data.NotificationTime ? new Date(data.NotificationTime).toISOString() : null,
            });

            reset();
            notify('Notification sent successfully');
            setTimeout(() => navigate('/display_all_group'), 1500);
        } catch (err) {
            console.error('Notification sending failed:', err);
            setError('Failed to send notification. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ol className="flex space-x-2 text-gray-500 font-semibold dark:text-white-dark">
                <li>
                    <Link to="/" className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Home</Link>
                </li>
                <li>/</li>
                <li>
                    <Link to="/notification/group/display" className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Group</Link>
                </li>
                <li>/</li>
                <li className="text-black dark:text-white-light">Group Notification</li>
            </ol>
            <div
                className="relative w-full flex justify-center items-center flex-col bg-white sm:w-[35rem] m-auto rounded-2xl shadow-2xl mt-8"
                style={{
                    borderRadius: '4px',
                    boxShadow: 'rgba(97, 75, 66, 0.7) 2px 2px 5px 0px',
                }}
            >
                          <div className='absolute top-3 right-3 hover:bg-gray-300 rounded-xl  ' onClick={()=>{
          navigate("/notification/group/display")
        }}>
          <CloseIcon  />
        </div>
                <ToastContainer />
                <h2 className="text-2xl font-bold m-8 font-cinzel">Group Notification</h2>

                <form className="flex flex-col p-4 gap-2 w-full m-auto mb-5" onSubmit={handleSubmit(onSubmit)}>
                    <input type="text" placeholder="Title" className="p-4 border-2 focus:outline-none rounded-lg" {...register('title', { required: 'Title is required' })} />
                    {errors.title && <span className="text-red-500">{errors.title.message}</span>}

                    <textarea placeholder="Body" className="p-4 border-2 focus:outline-none rounded-lg h-32 resize-none" {...register('body', { required: 'Body is required' })} />
                    {errors.body && <span className="text-red-500">{errors.body.message}</span>}
                    <input
                        type="text"
                        placeholder="Link"
                        className="p-4 border-2 focus:outline-none rounded-lg"
                        {...register('link', {
                            // required: 'Link is required',
                            minLength: { value: 3, message: 'Link must be at least 3 characters' },
                            // Optional: Add URL validation
                            pattern: {
                                value: /^(https?:\/\/)?([\w-]+?\.)+[\w-]+(\/[\w-./?%&=]*)?$/,
                                message: 'Please enter a valid URL',
                            },
                        })}
                    />
                    {errors.link && <span className="text-red-500">{errors.link.message}</span>}

                    <input type="datetime-local" className="p-4 border-2 focus:outline-none rounded-lg w-full" {...register('NotificationTime')} min={new Date().toISOString().slice(0, 16)} />
                    {error && <p className="text-red-500 text-center">{error}</p>}

                    <Button text={loading ? 'Sending...' : 'Submit'} loading={loading} />
                </form>
            </div>
        </>
    );
};

export default NotificationGroup;

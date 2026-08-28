import axios from 'axios';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/button/Button';
import { push_Notification } from '../../api/config';
import { ToastContainer, toast } from 'react-toastify';
import { useState } from 'react';

type FormData = {
    title: string;
    body: string;
    NotificationTime?: string; // Made optional
};

const AddNotification = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormData>();

    const notify = (msg: string) => toast.success(msg);

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        setLoading(true);
        setError(null);

        try {
            const payload = {
                title: data.title,
                body: data.body,
                topic: 'global',
                // ...(data.NotificationTime && { 
                //     NotificationTime: new Date(data.NotificationTime).toISOString() 
                NotificationTime: data.NotificationTime ? new Date(data.NotificationTime).toISOString() : null,
                // }),
            };

            console.log('Sending Payload:', payload);

            await axios.post(push_Notification, payload);

            notify(data.NotificationTime
                ? 'Notification scheduled successfully'
                : 'Notification sent immediately');
            reset();
            setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            console.error('Notification sending failed:', err);
            setError('Failed to send notification. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="w-full flex justify-center items-center flex-col bg-white sm:w-[35rem] m-auto rounded-2xl shadow-2xl mt-8"
            style={{
                borderRadius: '4px',
                boxShadow: 'rgba(97, 75, 66, 0.7) 2px 2px 5px 0px',
            }}
        >
            <ToastContainer />
            <h2 className="text-2xl font-bold m-8 font-cinzel">Send Notification</h2>

            <form className="flex flex-col p-4 gap-3 w-full m-auto mb-5" onSubmit={handleSubmit(onSubmit)}>
                <input
                    type="text"
                    placeholder="Title"
                    className="p-4 border-2 focus:outline-none rounded-lg"
                    {...register('title', { required: 'Title is required' })}
                />
                {errors.title && <span className="text-red-500">{errors.title.message}</span>}

                <textarea
                    placeholder="Body"
                    className="p-4 border-2 focus:outline-none rounded-lg h-32 resize-none"
                    {...register('body', { required: 'Body is required' })}
                />
                {errors.body && <span className="text-red-500">{errors.body.message}</span>}

                <input
                    type="datetime-local"
                    className="p-4 border-2 focus:outline-none rounded-lg"
                    {...register('NotificationTime', {
                        validate: (value) =>
                            !value || new Date(value) > new Date() || 'If provided, time must be in the future'
                    })}
                />
                {errors.NotificationTime && <span className="text-red-500">{errors.NotificationTime.message}</span>}

                {error && <span className="text-red-500">{error}</span>}

                <Button text={loading ? 'Sending...' : 'Submit'} loading={loading} />
            </form>
        </div>
    );
};

export default AddNotification;
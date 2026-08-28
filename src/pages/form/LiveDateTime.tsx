import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Button from '../../components/button/Button';
import axios from 'axios';
import { add_Live_Date_Time, display_all_head } from '../../api/config';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type FormData = {
    date: Date;
    time: Date;
};

function LiveDateTime() {
    const [loading, setLoading] = useState(false);
    const [headlines, setHeadlines] = useState([]);
    const navigate = useNavigate();

    const {
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm<FormData>();

    const notify = (msg: string) => toast.success(msg);

    const onSubmit = (data: FormData) => {
        setLoading(true);

        const formattedDate = data.date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        }); // e.g., "09 April 2025"

        const formattedTime = data.time.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        }); // e.g., "03:30 PM"

        const payload = {
            date: formattedDate,
            time: formattedTime,
        };

        axios
            .post(add_Live_Date_Time, payload)
            .then((response) => {
                console.log(response, 'success');
                notify('Live Date & Time added successfully!');
                reset();
                setTimeout(() => navigate('/'), 1500);
            })
            .catch((err) => {
                console.error(err);
                const backendMessage = err?.response?.data?.message || 'Something went wrong!';
                toast.error(backendMessage);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        axios
            .get(display_all_head)
            .then((response) => setHeadlines(response.data.headlines))
            .catch((error) => console.error(error));
    }, []);

    return (
        <div>
            <ToastContainer />
            <div className="w-full flex justify-center items-center flex-col bg-white sm:w-[35rem] m-auto rounded-2xl shadow-2xl mt-8">
                <h2 className="text-2xl font-bold m-8 font-cinzel">Add Live Date & Time</h2>
                <form className="w-full flex flex-col p-4 gap-4" onSubmit={handleSubmit(onSubmit)}>
                    <Controller
                        name="date"
                        control={control}
                        rules={{ required: 'Date is required' }}
                        render={({ field }) => (
                            <DatePicker
                                placeholderText="Select date"
                                selected={field.value}
                                onChange={(date) => field.onChange(date)}
                                className="p-4 border-2 rounded-lg w-full"
                                dateFormat="dd MMMM yyyy"
                                minDate={new Date()}
                            />
                        )}
                    />
                    {errors.date && <span className="text-red-500">{errors.date.message}</span>}

                    <Controller
                        name="time"
                        control={control}
                        rules={{ required: 'Time is required' }}
                        render={({ field }) => (
                            <DatePicker
                                placeholderText="Select time"
                                selected={field.value}
                                onChange={(time) => field.onChange(time)}
                                showTimeSelect
                                showTimeSelectOnly
                                timeIntervals={15}
                                timeCaption="Time"
                                dateFormat="h:mm aa"
                                className="p-4 border-2 rounded-lg w-full"
                            />
                        )}
                    />
                    {errors.time && <span className="text-red-500">{errors.time.message}</span>}

                    <Button text="Submit" loading={loading} />
                </form>
            </div>
        </div>
    );
}

export default LiveDateTime;

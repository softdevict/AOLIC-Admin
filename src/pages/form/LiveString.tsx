import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import Button from '../../components/button/Button';
import { add_new_live_update, display_new_live_update, stop_show_new_live_update } from '../../api/config';

type FormValues = {
    content: string;
};

function LiveString() {
    const navigate = useNavigate();
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newUpdate, setNewUpdate] = useState();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>();

    const fetchLiveLinks = () => {
        axios
            .get(display_new_live_update)
            .then((response) => {
                // console.log(response.data.data, 'content display');
                setContent(response.data.data);
                setNewUpdate(response.data.data[0].content);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    useEffect(() => {
        fetchLiveLinks();
    }, []);

    const notify = (msg: string) => toast.success(msg);
    const errorNotify = (msg: string) => toast.error(msg);

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        try {
            setLoading(true);
            const response = await axios.post(add_new_live_update, data);
            console.log(response.data, 'response');
            notify('Created successfully!');
            fetchLiveLinks(); // Refresh state after adding
        } catch (error) {
            console.error(error); // Handle error gracefully
            errorNotify('Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    const stopLive = () => {
        axios
            .delete(stop_show_new_live_update)
            .then((response) => {
                console.log(response.data, 'response');
                fetchLiveLinks(); // Refresh state after stopping
                errorNotify('Deleted successfully!');
                setTimeout(() => navigate('/'), 1000);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    return (
        <>
              <ol className="flex space-x-2 text-gray-500 font-semibold dark:text-white-dark">
          <li>
            <Link to="/" className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Home</Link>
          </li>
          <li>/</li>
          <li className="text-black dark:text-white-light">Live Updates
</li>
        </ol>
        <div className="">
            <ToastContainer />
            {content.length === 0 ? (
                <div
                    className="w-full flex justify-center items-center flex-col bg-white sm:w-[35rem] m-auto rounded-2xl shadow-2xl mt-8"
                    style={{
                        borderRadius: '4px',
                        boxShadow: 'rgba(97, 75, 66, 0.7) 2px 2px 5px 0px',
                    }}
                >
                    <h2 className="text-2xl font-bold m-8 font-cinzel">Live Updates</h2>
                    <form className="flex flex-col p-4 gap-2 w-full m-auto mb-5" onSubmit={handleSubmit(onSubmit)}>
                        <input
                            className="p-4 border-2 focus:outline-none rounded-lg"
                            type="text"
                            placeholder="New Update"
                            {...register('content', {
                                required: 'Content is required',
                            })}
                        />
                        {errors.content && <span className="text-red-500">{errors.content.message}</span>}
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
                    <h2 className="text-2xl font-bold font-cinzel mb-4">{newUpdate}</h2>
                    {/* <p className="text-blue-600 font-medium mb-4">{live[0].link}</p> */}
                    <button onClick={stopLive} className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition-all">
                        Delete
                    </button>
                </div>
            )}
        </div>
        </>
    );
}

export default LiveString;

import axios from 'axios';
import { useForm, SubmitHandler } from 'react-hook-form';
import { add_sos_no, display_GeofencingSOS, GeofencingSOS } from '../../api/config';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/button/Button';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import ToggleSwitch from '../../components/toggle/ToggleSwitch';

type FormData = {
    countryCode: string;
    phoneNumber: string;
};

function SOSForm() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>();
    const notify = (msg: string) => toast.success(msg);
    const onSubmit: SubmitHandler<FormData> = async (data) => {
        const payload = {
            phoneNumber: data.phoneNumber,
            countryCode: "+91",
        };

        try {
            setLoading(true);
            const response = await axios.post(add_sos_no, payload);
            console.log('Response:', response.data);
            notify('created successfully!');
            setTimeout(() => navigate('/'), 1000);
        } catch (err) {
            console.error('Error submitting SOS number:', err);
        } finally {
            setLoading(false);
        }
    };

    const adminType = localStorage.getItem("adminType");
    return (
        <>

            <div className='flex '>
                {adminType === "super admin" && (
                    <ol className="flex space-x-2 text-gray-500 font-semibold dark:text-white-dark">
                        <li>
                            <Link to="/" className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Home</Link>
                        </li>
                        <li>/</li>
                        <li className="text-black dark:text-white-light">SOS</li>
                    </ol>
                )}
            </div>
            <div className='flex justify-end'>
                <ToggleSwitch
                    fetchUrl={display_GeofencingSOS}
                    apiUrl={GeofencingSOS}
                />
            </div>
            <div
                className="w-full flex justify-center items-center flex-col bg-white sm:w-[35rem] m-auto rounded-2xl shadow-2xl mt-8"
                style={{
                    borderRadius: '4px',
                    boxShadow: 'rgba(97, 75, 66, 0.7) 2px 2px 5px 0px',
                }}
            >

                <ToastContainer />
                <h2 className="text-2xl font-bold m-8 font-cinzel">Add SOS Number</h2>

                <form className="flex flex-col p-4 gap-4 w-full m-auto mb-5" onSubmit={handleSubmit(onSubmit)}>
                    <label className="text-lg font-medium">Emergency Number</label>
                    <div className="flex gap-2">
                        
                        <input
                            className=" w-[4rem] p-4 border-2 rounded-lg bg-gray-100 text-gray-600"
                            value="+91"
                            disabled
                        />

                        <input
                            type="text"
                            placeholder="Enter 10-digit number"
                            className="p-4 border-2 flex-1 rounded-lg focus:outline-none w-full"
                            {...register('phoneNumber', {
                                required: 'Phone number is required',
                                pattern: {
                                    value: /^[0-9]{10}$/,
                                    message: 'Enter a valid 10-digit number',
                                },
                            })}
                        />
                    </div>

                    {errors.phoneNumber && <span className="text-red-500">{errors.phoneNumber.message}</span>}

                    <Button text="Submit" loading={loading} />
                </form>
            </div>
        </>
    );
}

export default SOSForm;

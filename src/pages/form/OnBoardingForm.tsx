import React, { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import Button from '../../components/button/Button';
import { ToastContainer, toast } from 'react-toastify';
import { add_onBoarding } from '../../api/config';
import { Link, useNavigate } from 'react-router-dom';

interface OnBoardingFormData {
    thumbnail: FileList;
    //   title: string;
    //   body: string;
}

function OnBoardingForm() {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<OnBoardingFormData>();
    const navigate = useNavigate();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const preview = URL.createObjectURL(file);
            setImagePreview(preview);
        }
    };

    const onSubmit = async (data: OnBoardingFormData) => {
        setLoading(true);

        const formData = new FormData();
        formData.append('img', data.thumbnail[0]); // Assuming `thumbnail` is a file input
        // formData.append('title', data.title);
        // formData.append('body', data.body);

        try {
            const response = await axios.post(add_onBoarding, formData);
            if (response.data.success) {
                toast.success('Onboarding screen added successfully!');
                navigate('/');
            } else {
                toast.error(response.data.message || 'Something went wrong!');
            }
        } catch (error) {
            toast.error('Failed to add onboarding.');
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
                        <Link to="/" className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Home</Link>
                    </li>
                    <li>/</li>
                    <li className="text-black dark:text-white-light">On Boarding Img</li>
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
                <h2 className="text-2xl font-bold m-8 font-cinzel">Add Your Onboarding Screen</h2>

                <form className="flex flex-col p-4 gap-2 w-full m-auto mb-5" onSubmit={handleSubmit(onSubmit)}>
                    {/* Image Upload */}
                    <label htmlFor="thumbnail" className="bg-black-light rounded-lg font-poppins">
                        <input className="p-3 font-poppins" type="file" {...register('thumbnail', { required: 'Image is required' })} onChange={handleImageChange} />
                    </label>
                    {errors.thumbnail && <span className="text-red-500">{errors.thumbnail.message}</span>}
                    {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-48 h-48 object-cover rounded-lg border" />}

             
                    <Button text="Submit" loading={loading} />
                </form>
            </div>
        </>
    );
}

export default OnBoardingForm;

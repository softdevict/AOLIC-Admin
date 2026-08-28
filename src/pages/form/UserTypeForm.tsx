import axios from 'axios';
import { useForm, SubmitHandler } from 'react-hook-form';
import { create_user_type } from '../../api/config';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/button/Button';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type FormData = {
    usertype: string;
    link: string;
    img: FileList;
};

function UserTypeForm() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormData>();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
            return () => URL.revokeObjectURL(previewUrl); // Cleanup
        }
    };

    const notify = (msg: string) => toast.success(msg);

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        const formData = new FormData();
        formData.append('usertype', data.usertype);
        formData.append('link', data.link);
        formData.append('img', data.img[0]);

        try {
            setLoading(true);
            const response = await axios.post(create_user_type, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            notify('User type created successfully!');
            reset();
            setImagePreview(null);
            setTimeout(() => navigate('/user_type'), 1500);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to create user type';
            toast.error(errorMessage);
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
            <h2 className="text-2xl font-bold m-8 font-cinzel">Create User Type</h2>

            <form className="w-full flex flex-col p-4 gap-4  m-auto mb-5" onSubmit={handleSubmit(onSubmit)}>
                <input type="text" placeholder="User Type" className="p-4 border-2 focus:outline-none rounded-lg" {...register('usertype', { required: 'User type is required' })} />
                {errors.usertype && <span className="text-red-500">{errors.usertype.message}</span>}

                <div>
                    {/* <label className="block text-sm font-medium text-gray-700 mb-1">Link *</label> */}
                    <input
                        type="text"
                        placeholder="Enter link"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        {...register('link', {
                            required: 'Link is required',
                            pattern: {
                                value: /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i,
                                message: 'Please enter a valid URL',
                            },
                        })}
                    />
                    {errors.link && <p className="mt-1 text-sm text-red-600">{errors.link.message}</p>}
                </div>

                <input type="file" accept="image/*" className="p-2 rounded-lg border-2" {...register('img', { required: 'Image is required' })} onChange={handleImageChange} />
                {errors.img && <span className="text-red-500">{errors.img.message}</span>}

                {/* Image Preview */}
                {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-48 h-48 object-cover rounded-lg border" />}

                <Button text="Submit" loading={loading} />
            </form>
        </div>
    );
}

export default UserTypeForm;

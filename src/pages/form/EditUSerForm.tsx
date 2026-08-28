import { useLocation, useNavigate } from 'react-router-dom';
import { delete_user_type, update_user_type } from '../../api/config';
import { useForm } from 'react-hook-form';
import axios, { AxiosError } from 'axios';
import { useState, useEffect } from 'react';
import Button from '../../components/button/Button';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type FormData = {
    usertype: string;
    link: string;
    img?: FileList;
};

type LocationState = {
    usertype: string;
    img: string;
    link: string;
    _id: string;
};

const EditUserForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Get initial values from location state with proper typing
    const { usertype, img, link, _id } = (location.state as LocationState) || {};

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<FormData>({
        defaultValues: {
            usertype: usertype || '',
            link: link || '',
        },
    });

    // Watch for image changes
    const watchImage = watch('img');

    useEffect(() => {
        if (img) {
            setImagePreview(img);
        }
    }, [img]);

    useEffect(() => {
        if (watchImage?.[0]) {
            const file = watchImage[0];
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);

            // Cleanup
            return () => URL.revokeObjectURL(previewUrl);
        }
    }, [watchImage]);

    const notify = {
        success: (msg: string) => toast.success(msg),
        error: (msg: string) => toast.error(msg),
    };

    const onSubmit = async (data: FormData) => {
        try {
            setLoading(true);

            const formData = new FormData();
            formData.append('usertype', data.usertype);
            formData.append('link', data.link);

            if (data.img?.[0]) {
                formData.append('img', data.img[0]);
            }

            await axios.patch(`${update_user_type}/${_id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            notify.success('User type updated successfully');
            setTimeout(() => navigate('/user_type'), 1000);
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            console.error('Update Error:', axiosError);
            notify.error(axiosError.response?.data?.message || 'Failed to update user type');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this user type?')) return;

        try {
            setLoading(true);
            await axios.delete(`${delete_user_type}/${_id}`);
            notify.success('User type deleted successfully');
            setTimeout(() => navigate('/user_type'), 1000);
        } catch (error) {
            const axiosError = error as AxiosError<{ message?: string }>;
            console.error('Delete Error:', axiosError);
            notify.error(axiosError.response?.data?.message || 'Failed to delete user type');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                <ToastContainer position="top-right" autoClose={3000} />

                <div className="p-8">
                    <h2 className="text-2xl font-bold text-center mb-6">Edit User Type</h2>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* User Type Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">User Type *</label>
                            <input
                                className={`w-full p-3 border rounded-lg ${errors.usertype ? 'border-red-500' : 'border-gray-300'}`}
                                type="text"
                                placeholder="Enter user type"
                                {...register('usertype', {
                                    required: 'User type is required',
                                    maxLength: {
                                        value: 50,
                                        message: 'User type cannot exceed 50 characters',
                                    },
                                })}
                            />
                            {errors.usertype && <p className="mt-1 text-sm text-red-600">{errors.usertype.message}</p>}
                        </div>

                        {/* Link Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Link *</label>
                            <input
                                className={`w-full p-3 border rounded-lg ${errors.link ? 'border-red-500' : 'border-gray-300'}`}
                                type="text"
                                placeholder="Enter link (https://...)"
                                {...register('link', {
                                    required: 'Link is required',
                                    pattern: {
                                        value: /^https?:\/\//,
                                        message: 'Please enter a valid URL starting with http:// or https://',
                                    },
                                })}
                            />
                            {errors.link && <p className="mt-1 text-sm text-red-600">{errors.link.message}</p>}
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                            <input className="w-full p-2 border border-gray-300 rounded-lg" type="file" accept="image/*" {...register('img')} />
                            {imagePreview && (
                                <div className="mt-3">
                                    <img src={imagePreview} alt="Preview" className="w-48 h-48 object-cover rounded-lg border" />
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between pt-6">
                            <button type="button" onClick={handleDelete} disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                                Delete
                            </button>

                            <Button text={loading ? 'Saving...' : 'Save Changes'} loading={loading} />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditUserForm;

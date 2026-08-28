import { useLocation, useNavigate } from 'react-router-dom';
import { delete_action, update_action, update_card } from '../../api/config';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useState, useEffect } from 'react';
import Button from '../../components/button/Button';
import { ToastContainer, toast } from 'react-toastify';

type FormData = {
    action: string;
    link: string;
    img: FileList;
};

const ActionEditForm = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    // console.log(location, 'location');
    const [imagePreview, setImagePreview] = useState<string | null>(location.state?.img);

    const { link, action, img, id } = location.state || {}; // Getting initial values
    console.log(id, 'id');

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue, // To update form values dynamically
    } = useForm<FormData>();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        }
    };
    // Ensure form state updates when location state changes
    useEffect(() => {
        setValue('action', action || '');
        setValue('link', link || '');
    }, [action, link, setValue]);

    // Handle form submission
    const notify = (msg: string) => toast.success(msg);
    const errorNotify = (msg: string) => toast.error(msg);
    const onSubmit = async (data: FormData) => {
        try {
            setLoading(true);
            console.log('Submitted Data:', data);

            const formData = new FormData();
            formData.append('action', data.action);
            formData.append('link', data.link);

            // Ensure img exists before appending
            if (data.img && data.img.length > 0) {
                formData.append('img', data.img[0]); // Append the first file
            }

            // Debug FormData content
            for (const pair of formData.entries()) {
                console.log(pair[0], pair[1]);
            }

            // Make the PATCH request
            const response = await axios.patch(`${update_action}/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Ensure proper encoding
                },
            });

            console.log(response.data, 'Updated Successfully');
            notify('Successfully updated');
            setTimeout(() => navigate('/user_type'), 1000);
        } catch (err) {
            console.error('Error updating card:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle delete action
    const deleteAction = async () => {
        try {
            const response = await axios.delete(`${delete_action}/${id}`);
            console.log(response.data, 'Deleted Successfully');
            errorNotify('Deleted successfully');
            setTimeout(() => navigate('/user_type'), 1000);
        } catch (err) {
            console.error('Error deleting card:', err);
        }
    };

    return (
        <div>
            <div className="w-full flex justify-center items-center flex-col bg-white sm:w-[35rem] m-auto rounded-2xl shadow-2xl mt-8">
                <ToastContainer />
                <h2 className="text-2xl font-bold m-8 font-cinzel">Edit Action</h2>
                <form className="flex flex-col p-4 gap-2 w-full m-auto mb-5" onSubmit={handleSubmit(onSubmit)}>
                    {/* Action Input */}
                    <input className="p-4 border-2 focus:outline-none rounded-lg font-poppins" type="text" placeholder="Action" {...register('action', { required: true, maxLength: 80 })} />
                    {errors.action && <span className="text-red-500 font-poppins">Action is required</span>}

                    {/* Link Input */}
                    <input
                        className="p-4 border-2 focus:outline-none rounded-lg font-poppins"
                        type="text"
                        placeholder="Link"
                        {...register('link', {
                            required: true,
                            // maxLength: 100,
                            pattern: {
                                value: /^https:\/\//,
                                message: 'Please enter a valid URL (starting with https://)',
                            },
                        })}
                    />
                    {errors.link && <span className="text-red-500 font-poppins">{errors.link.message}</span>}

                    {/* Image Upload */}
                    <input className="p-3 focus:outline-none rounded-lg font-poppins" type="file" accept="image/*" {...register('img')} onChange={handleImageChange} />
                    {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-48 h-48 object-cover rounded-lg border" />}

                    {/* Buttons */}
                    <div className="p-4 flex justify-around">
                        <Button text="Submit" loading={loading} />
                        <button onClick={deleteAction} type="button" className="bg-red-400 px-5 py-1 rounded-xl hover:text-white hover:bg-red-600 font-poppins">
                            DELETE
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ActionEditForm;

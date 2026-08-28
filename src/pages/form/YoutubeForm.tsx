import { useForm, SubmitHandler } from 'react-hook-form';
import Button from '../../components/button/Button';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { add_youtube_link } from '../../api/config';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';

type FormValues = {
    YouTubeLink: string;
    platform: string;
    thumbnail?: FileList;
    thumbnailName: string;
};

function YoutubeForm() {
    const navigate = useNavigate();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>();
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        }
    };
    const notify = (msg: string) => toast.success(msg);
    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        setLoading(true); // Start loading state
        console.log(data);

        const formData = new FormData();
        formData.append('YouTubeLink', data.YouTubeLink);
        formData.append('platform', data.platform);
        formData.append('thumbnailName', data.thumbnailName);

        // Append thumbnail only if a file is selected
        if (data.thumbnail && data.thumbnail.length > 0) {
            formData.append('thumbnail', data.thumbnail[0]);
        }

        console.log(formData, 'formData');

        try {
            const response = await axios.post(add_youtube_link, formData);
            console.log(response, 'response');
            notify('created successfully!');
            setTimeout(() => navigate('/'), 1000);
        } catch (error) {
            console.log(error); // Handle error gracefully
            toast.error('Something went wrong!');
        } finally {
            setLoading(false); // End loading state
        }
    };

    const platform = ['mobile', 'web', 'both'];
    const adminType = localStorage.getItem("adminType");
    return (
        <>
            {adminType === "super admin" && (
                <ol className="flex space-x-2 text-gray-500 font-semibold dark:text-white-dark">
                    <li>
                        <Link to="/" className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Home</Link>
                    </li>
                    <li>/</li>
                    <li className="text-black dark:text-white-light">Peace Of Mind</li>
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
                <h2 className="text-2xl font-bold m-8 font-cinzel">Add Your YouTube Link</h2>
                <form className="flex flex-col p-4 gap-2 w-full m-auto mb-5" onSubmit={handleSubmit(onSubmit)}>
                    {/* YouTube Link */}
                    <input
                        className="p-4 border-2 focus:outline-none rounded-lg"
                        type="text"
                        placeholder="YouTube Link"
                        {...register('YouTubeLink', {
                            required: 'YouTube Link is required',
                            pattern: {
                                value: /^https:\/\//,
                                message: 'Please enter a valid URL (starting with https://)',
                            },
                        })}
                    />
                    {errors.YouTubeLink && <span className="text-red-500">{errors.YouTubeLink.message}</span>}
                    {/* Platform */}
                    <select className="p-4 border-2 focus:outline-none rounded-lg" {...register('platform', { required: 'Please select a platform' })}>
                        <option value="">Select a Platform</option>
                        {platform.map((value, index) => (
                            <option key={index} value={value}>
                                {value}
                            </option>
                        ))}
                    </select>
                    {errors.platform && <span className="text-red-500">{errors.platform.message}</span>}
                    {/* Image Upload (Optional) */}
                    <label htmlFor="thumbnail" className="bg-black-light rounded-lg font-poppins">
                        <input className="p-3 font-poppins" type="file" {...register('thumbnail', { required: 'Image is require' })} onChange={handleImageChange} />
                    </label>
                    {errors.thumbnail && <span className="text-red-500">{errors.thumbnail.message}</span>}
                    {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-48 h-48 object-cover rounded-lg border" />}
                    <input
                        className="p-4 border-2 focus:outline-none rounded-lg"
                        type="text"
                        placeholder="Thumbnail Name"
                        {...register('thumbnailName', {
                            required: 'Thumbnail Name is required',
                        })}
                    />
                    {errors.YouTubeLink && <span className="text-red-500">{errors.YouTubeLink.message}</span>}

                    {/* Submit Button */}
                    <Button text="Submit" loading={loading} />
                    {/* Assuming your Button component takes a "text" prop to display the label */}
                </form>
            </div>
        </>
    );
}

export default YoutubeForm;

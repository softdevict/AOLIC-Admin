import { Link, useLocation, useNavigate } from 'react-router-dom';
import { delete_audioTour, update_audioTour } from '../../api/config';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useState, useEffect } from 'react';
import Button from '../../components/button/Button';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CloseIcon from '@mui/icons-material/Close';

type FormData = {
    audioDirectionName: string;
    audioDirectionText: string;
    longitude: number;
    latitude: number;
    audioDirectionImg: FileList;
    audioLink: FileList;
    videoLink: string;
};

const AudioTourModification: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [audioLoading, setAudioLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Extract initial values from location.state
    const { audioDirectionName, audioDirectionImg, audioDirectionText, longitude, latitude, audioLink, videoLink, _id } = location.state || {};

    const [imagePreview, setImagePreview] = useState<string | null>(audioDirectionImg || null);
    const [audioPreview, setAudioPreview] = useState<string | null>(audioLink || null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
    } = useForm<FormData>({
        defaultValues: {
            audioDirectionName: audioDirectionName || '',
            audioDirectionText: audioDirectionText || '',
            longitude: longitude || 0,
            latitude: latitude || 0,
            videoLink: videoLink || '',
        },
    });

    // Update form values when location.state changes
    useEffect(() => {
        setValue('audioDirectionName', audioDirectionName || '');
        setValue('audioDirectionText', audioDirectionText || '');
        setValue('longitude', longitude || 0);
        setValue('latitude', latitude || 0);
        setValue('videoLink', videoLink || '');
    }, [audioDirectionName, audioDirectionText, longitude, latitude, videoLink, setValue]);

    // Handle image preview
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Handle audio preview
    const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAudioPreview(URL.createObjectURL(file));
        }
    };

    // Notifications
    const notify = (msg: string) => toast.success(msg);
    const errorNotify = (msg: string) => toast.error(msg);

    // Handle form submission
    const onSubmit = async (data: FormData) => {
        try {
            setLoading(true);
            console.log('Submitted Data:', data);

            const formData = new FormData();
            formData.append('audioDirectionName', data.audioDirectionName);
            formData.append('audioDirectionText', data.audioDirectionText);
            formData.append('longitude', data.longitude.toString());
            formData.append('latitude', data.latitude.toString());
            formData.append('videoLink', data.videoLink);

            if (data.audioDirectionImg && data.audioDirectionImg.length > 0) {
                formData.append('audioDirectionImg', data.audioDirectionImg[0]);
            }

            if (data.audioLink && data.audioLink.length > 0) {
                formData.append('audioLink', data.audioLink[0]);
            }

            // Debug FormData
            for (const pair of formData.entries()) {
                console.log(pair[0], pair[1]);
            }

            // Send PATCH request
            const response = await axios.patch(`${update_audioTour}/${_id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log(response.data, 'Updated Successfully');
            notify('Audio tour updated successfully');
            setTimeout(() => navigate('/direction'), 1500);
        } catch (err) {
            console.error('Error updating audio tour:', err);
            errorNotify('Failed to update audio tour');
        } finally {
            setLoading(false);
        }
    };

    // Handle delete action
    const deleteAction = async () => {
        try {
            setAudioLoading(true);
            const response = await axios.delete(`${delete_audioTour}/${_id}`);
            console.log(response.data, 'Deleted Successfully');
            notify('Audio tour deleted successfully');
            setTimeout(() => navigate('/direction'), 1500);
        } catch (err) {
            console.error('Error deleting audio tour:', err);
            errorNotify('Failed to delete audio tour');
        } finally {
            setAudioLoading(false);
        }
    };

    return (
        <>
            <ol className="flex text-gray-500 font-semibold dark:text-white-dark space-x-2">
                <li>
                    <Link to="/">
                        <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Home</button>
                    </Link>
                </li>
                <li>/</li>
                <li>
                    <Link to="/direction">
                        <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">  Maps and Tours</button>
                    </Link>
                </li>
                <li>/</li>
                <li>
                    <button className="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70">

                        Edit Audio Tour
                    </button>
                </li>
            </ol>
            <div className="p-4">
                <div className="w-full max-w-[40rem] mx-auto bg-white rounded-2xl shadow-xl overflow-hidden relative">

                    <div className='absolute top-3 right-3 hover:bg-gray-300 rounded-xl  ' onClick={() => {
                        navigate("/direction")
                    }}>
                        <CloseIcon />
                    </div>
                    <ToastContainer position="top-right" autoClose={3000} />
                    <h2 className="text-2xl font-bold p-6 bg-gray-50 font-cinzel text-center">Edit Audio Tour</h2>

                    <form className="p-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
                        {/* Audio Tour Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tour Name</label>
                            <input
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                type="text"
                                placeholder="Audio Tour Name"
                                {...register('audioDirectionName', {
                                    required: 'Tour name is required',
                                    maxLength: { value: 100, message: 'Name must be 100 characters or less' },
                                })}
                            />
                            {errors.audioDirectionName && <p className="mt-1 text-sm text-red-600">{errors.audioDirectionName.message}</p>}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Tour description"
                                rows={4}
                                {...register('audioDirectionText', {
                                    required: 'Description is required',
                                    maxLength: { value: 500, message: 'Description must be 500 characters or less' },
                                })}
                            />
                            {errors.audioDirectionText && <p className="mt-1 text-sm text-red-600">{errors.audioDirectionText.message}</p>}
                        </div>

                        {/* Location Fields */}
                        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                            <input
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                type="number"
                                step="any"
                                placeholder="Latitude"
                                {...register('latitude', {
                                    required: 'Latitude is required',
                                    valueAsNumber: true,
                                })}
                            />
                            {errors.latitude && <p className="mt-1 text-sm text-red-600">{errors.latitude.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                            <input
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                type="number"
                                step="any"
                                placeholder="Longitude"
                                {...register('longitude', {
                                    required: 'Longitude is required',
                                    valueAsNumber: true,
                                })}
                            />
                            {errors.longitude && <p className="mt-1 text-sm text-red-600">{errors.longitude.message}</p>}
                        </div>
                        {/* </div> */}


                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tour Image</label>
                            <input className="w-full p-2 border border-gray-300 rounded-lg" type="file" accept="image/*" {...register('audioDirectionImg')} onChange={handleImageChange} />
                            {imagePreview && (
                                <div className="mt-3">
                                    <img src={imagePreview} alt="Preview" className="w-48 h-48 object-cover rounded-lg border" />
                                    <p className="mt-1 text-sm text-gray-500">Image Preview</p>
                                </div>
                            )}
                        </div>
                        {/* Video Link */}
                        {videoLink && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Video Link (Optional)</label>
                                <input
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    type="url"
                                    placeholder="https://example.com/video"
                                    {...register('videoLink')}
                                />
                            </div>
                        )}
                        {/* Audio Upload */}
                        {audioPreview && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Audio File</label>
                                <input className="w-full p-2 border border-gray-300 rounded-lg" type="file" accept="audio/*" {...register('audioLink')} onChange={handleAudioChange} />
                                {/* {audioPreview && (
                                <div className="mt-3">
                                    <audio controls className="w-full mt-2">
                                        <source src={audioPreview} type="audio/mpeg" />
                                        Your browser does not support the audio element.
                                    </audio>
                                    <p className="mt-1 text-sm text-gray-500">Audio Preview</p>
                                </div>
                            )} */}
                                {audioPreview && (
                                    <div className="mt-3">
                                        <audio key={audioPreview} controls className="w-full mt-2">
                                            <source src={audioPreview} type="audio/mpeg" />
                                            Your browser does not support the audio element.
                                        </audio>
                                        <p className="mt-1 text-sm text-gray-500">Audio Preview</p>
                                    </div>
                                )}

                            </div>)}

                        {/* Action Buttons */}
                        <div className="flex justify-around space-x-4 pt-6">
                            {/* <Button text={loading ? 'Saving...' : 'Save Changes'} loading={loading} type="submit" /> */}
                            <Button text={loading ? 'Saving...' : 'Save Changes'} loading={loading} />
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AudioTourModification;

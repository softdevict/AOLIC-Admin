import { Link, useLocation, useNavigate } from 'react-router-dom';
import { add_direction } from '../../api/config';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useState, useEffect } from 'react';
import Button from '../../components/button/Button';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CloseIcon from '@mui/icons-material/Close';

type FormData = {
    directionName: string;
    directionDescription: string;
    longitude: number;
    latitude: number;
    directionImg?: FileList;
    directionusertype: string;
    directionUserModel: string;
    language: string;
    audioTourModel: string;
    audioDirectionText: string;
    audioLink?: FileList;
    videoLink: string;
};

const AddDirection: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const { directionName, directionImg, directionDescription, longitude, latitude, directionusertype, id, directionUserModel, language, audioTourModel, audioDirectionText, videoLink } =
        location.state || {};

    const [imagePreview, setImagePreview] = useState<string | null>(directionImg || null);
    const [audioPreview, setAudioPreview] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<FormData>({
        defaultValues: {
            directionName: directionName || '',
            directionDescription: directionDescription || '',
            longitude: longitude || undefined,
            latitude: latitude || undefined,
            directionusertype: directionusertype || 'Both',
            directionUserModel: directionUserModel || 'Maps Tour only',
            language: language || 'en',
            audioTourModel: audioTourModel || 'Walk Tour',
            audioDirectionText: audioDirectionText || '',
            videoLink: videoLink || '',
        },
    });

    const watchedDirectionUserModel = watch('directionUserModel');

    useEffect(() => {
        // Clean up object URLs when component unmounts
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
            if (audioPreview) URL.revokeObjectURL(audioPreview);
        };
    }, [imagePreview, audioPreview]);

    useEffect(() => {
        setValue('directionName', directionName || '');
        setValue('directionDescription', directionDescription || '');
        setValue('longitude', longitude || undefined);
        setValue('latitude', latitude || undefined);
        setValue('directionusertype', directionusertype || 'Both');
        setValue('directionUserModel', directionUserModel || 'Maps Tour only');
        setValue('language', language || 'en');
        setValue('audioTourModel', audioTourModel || 'Walk Tour');
        setValue('audioDirectionText', audioDirectionText || '');
        setValue('videoLink', videoLink || '');
        setImagePreview(directionImg || null);
    }, [directionName, directionDescription, longitude, latitude, directionusertype, directionUserModel, language, audioTourModel, audioDirectionText, videoLink, setValue]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImagePreview(directionImg || null);
        }
    };

    const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (audioPreview) URL.revokeObjectURL(audioPreview);
            setAudioPreview(URL.createObjectURL(file));
        } else {
            setAudioPreview(null);
        }
    };

    const notify = (msg: string) => toast.success(msg);
    const errorNotify = (msg: string) => toast.error(msg);

    const onSubmit = async (data: FormData) => {
        try {
            setLoading(true);

            const formData = new FormData();
            formData.append('directionName', data.directionName);
            formData.append('directionDescription', data.directionDescription);
            formData.append('longitude', data.longitude.toString());
            formData.append('latitude', data.latitude.toString());
            formData.append('directionusertype', data.directionusertype === 'Program Participant' ? 'Participant' : data.directionusertype);
            formData.append('directionUserModel', data.directionUserModel);

            if (data.directionImg?.[0]) {
                formData.append('directionImg', data.directionImg[0]);
            }

            if (data.directionUserModel === 'Tour and Maps') {
                formData.append('language', data.language);
                formData.append('audioTourModel', data.audioTourModel);
                formData.append('audioDirectionText', data.audioDirectionText);
                formData.append('videoLink', data.videoLink);

                if (data.audioLink?.[0]) {
                    formData.append('audioLink', data.audioLink[0]);
                }
            }

            const response = id
                ? await axios.patch(`${add_direction}/${id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                })
                : await axios.post(add_direction, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

            notify(id ? 'Direction updated successfully' : 'Direction added successfully');

            if (!id) {
                reset();
                setImagePreview(null);
                setAudioPreview(null);
            }

            setTimeout(() => navigate('/direction'), 1000);
        } catch (err: any) {
            console.error('Error:', err);
            errorNotify(err.response?.data?.message || 'Failed to process direction');
        } finally {
            setLoading(false);
        }
    };

    const directionusertypeOptions = ['Visitor', 'Program Participant', 'Both'];
    const audioTourModelOptions = ['Vehicle Tour', 'Walk Tour', 'Video Tour'];
    const selectedAudioTourModel = watch("audioTourModel");
    const adminType = localStorage.getItem("adminType");
    return (
        <>
            {adminType === "super admin" && (
                <ol className="flex text-gray-500 font-semibold dark:text-white-dark space-x-2">
                    <Link to="/">
                        <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70"

                        >Home</button>
                    </Link>

                    <li>/</li>
                    <Link to="/direction">
                        <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70"

                        >Map and Tour</button>
                    </Link>

                    <li>/</li>

                    <li>
                        <button className="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70">Add Ashram Maps</button>
                    </li>
                </ol>
            )}
            <div className=''>
                <div className="relative w-full flex justify-center items-center flex-col sm:w-[35rem] m-auto rounded-2xl shadow-2xl mt-8">
                    <ToastContainer />
                    {adminType === "super admin" && (
                        <div className='absolute top-3 right-3 hover:bg-gray-300 rounded-xl  ' onClick={() => {
                            navigate("/direction")
                        }}>
                            <CloseIcon />
                        </div>
                    )}
                    <h2 className="text-2xl font-bold m-8 font-cinzel">{id ? 'Edit Direction' : 'Add Direction'}</h2>
                    <form className="flex flex-col p-4 gap-2 w-full m-auto mb-5 " onSubmit={handleSubmit(onSubmit)} noValidate>
                        <input
                            className="p-4 border-2 focus:outline-none rounded-lg font-poppins"
                            type="text"
                            placeholder="Direction Name"
                            {...register('directionName', {
                                required: 'Direction name is required',
                                maxLength: { value: 80, message: 'Direction name must be 80 characters or less' },
                            })}
                        />
                        {errors.directionName && <span className="text-red-500 font-poppins">{errors.directionName.message}</span>}

                        <textarea
                            className="p-4 border-2 focus:outline-none rounded-lg font-poppins"
                            placeholder="Direction Description"
                            rows={4}
                            {...register('directionDescription', {
                                required: 'Description is required',
                                maxLength: { value: 500, message: 'Description must be 500 characters or less' },
                            })}
                        />
                        {errors.directionDescription && <span className="text-red-500 font-poppins">{errors.directionDescription.message}</span>}

                        <label className="bg-black-light rounded-lg">
                            <input
                                className="p-3 focus:outline-none rounded-lg"
                                type="file"
                                accept="image/*"
                                {...register('directionImg', {
                                    required: id ? false : 'Image is required',
                                })}
                                onChange={handleImageChange}
                            />
                        </label>
                        {errors.directionImg && <span className="text-red-500">{errors.directionImg.message}</span>}
                        {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-48 h-48 object-cover rounded-lg border" />}

                        <input
                            className="p-4 border-2 focus:outline-none rounded-lg font-poppins"
                            type="number"
                            step="any"
                            placeholder="latitude"
                            {...register('latitude', {
                                required: 'Latitude is required',
                                valueAsNumber: true,
                                min: { value: -90, message: 'Latitude must be between -90 and 90' },
                                max: { value: 90, message: 'Latitude must be between -90 and 90' },
                            })}
                        />
                        {errors.latitude && <span className="text-red-500 font-poppins">{errors.latitude.message}</span>}
                        <input
                            className="p-4 border-2 focus:outline-none rounded-lg font-poppins"
                            type="number"
                            step="any"
                            placeholder="longitude"
                            {...register('longitude', {
                                required: 'Longitude is required',
                                valueAsNumber: true,
                                min: { value: -180, message: 'Longitude must be between -180 and 180' },
                                max: { value: 180, message: 'Longitude must be between -180 and 180' },
                            })}
                        />
                        {errors.longitude && <span className="text-red-500 font-poppins">{errors.longitude.message}</span>}

                        <select className="p-4 border-2 focus:outline-none rounded-lg" {...register('directionusertype', { required: 'Please select a user type' })}>
                            <option value="">Select a User Type</option>
                            {directionusertypeOptions.map((value, index) => (
                                <option key={index} value={value}>
                                    {value}
                                </option>
                            ))}
                        </select>
                        {errors.directionusertype && <span className="text-red-500">{errors.directionusertype.message}</span>}

                        <select className="p-4 border-2 focus:outline-none rounded-lg" {...register('directionUserModel', { required: 'Please select a direction user model' })}>
                            <option value="Maps Tour only">Maps Tour only</option>
                            <option value="Tour and Maps">Tour and Maps</option>
                        </select>
                        {errors.directionUserModel && <span className="text-red-500">{errors.directionUserModel.message}</span>}

                        {watchedDirectionUserModel === 'Tour and Maps' && (
                            <>
                                <select
                                    className="p-4 border-2 focus:outline-none rounded-lg"
                                    {...register('language', { required: 'Language is required' })}
                                >
                                    <option value="en">English</option>
                                    <option value="hi">Hindi</option>
                                    <option value="kn">Kannada</option>
                                    <option value="ta">Tamil</option>
                                    <option value="te">Telugu</option>
                                    <option value="gu">Gujarati</option>
                                    <option value="mr">Marathi</option>
                                    <option value="ml">Malayalam</option>
                                    <option value="pa">Punjabi</option>
                                    <option value="bn">Bengali</option>
                                    <option value="ru">Russian</option>
                                    <option value="es">Spanish</option>
                                    <option value="zh">Mandarin Chinese</option>
                                    <option value="mn">Mongolian</option>
                                    <option value="pl">Polish</option>
                                    <option value="bg">Bulgarian</option>
                                    <option value="fr">French</option>
                                    <option value="de">German</option>
                                    <option value="nl">Dutch</option>
                                    <option value="it">Italian</option>
                                    <option value="pt">Portuguese</option>
                                    <option value="ja">Japanese</option>
                                    <option value="vi">Vietnamese</option>
                                </select>

                                {errors.language && <span className="text-red-500 font-poppins">{errors.language.message}</span>}

                                <select className="p-4 border-2 focus:outline-none rounded-lg" {...register('audioTourModel', { required: 'Please select an audio tour model' })}>
                                    <option value="">Select an Audio Tour Model</option>
                                    {audioTourModelOptions.map((value, index) => (
                                        <option key={index} value={value}>
                                            {value}
                                        </option>
                                    ))}
                                </select>
                                {errors.audioTourModel && <span className="text-red-500">{errors.audioTourModel.message}</span>}

                                <textarea
                                    className="p-4 border-2 focus:outline-none rounded-lg font-poppins"
                                    placeholder="Audio Direction Text"
                                    rows={4}
                                    {...register('audioDirectionText', {
                                        required: 'Audio direction text is required for Tour and Maps',
                                        maxLength: { value: 500, message: 'Audio direction text must be 500 characters or less' },
                                    })}
                                />
                                {errors.audioDirectionText && <span className="text-red-500 font-poppins">{errors.audioDirectionText.message}</span>}
                                {(selectedAudioTourModel === "Vehicle Tour" || selectedAudioTourModel === "Walk Tour") && (

                                    <input
                                        className="p-4 border-2 focus:outline-none rounded-lg"
                                        type="file"
                                        accept="audio/mp3,audio/mpeg"
                                        {...register('audioLink')}
                                        onChange={handleAudioChange}
                                    />)}
                                {errors.audioLink && <span className="text-red-500">{errors.audioLink.message}</span>}
                                {audioPreview && (
                                    <audio controls className="mt-2 w-full">
                                        <source src={audioPreview} type="audio/mpeg" />
                                        Your browser does not support the audio element.
                                    </audio>
                                )}
                                {selectedAudioTourModel === "Video Tour" && (
                                    <input className="p-4 border-2 focus:outline-none rounded-lg font-poppins" type="text" placeholder="Video Link (Optional)" {...register('videoLink')} />)}
                            </>
                        )}

                        <Button text="Submit" loading={loading} />
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddDirection;

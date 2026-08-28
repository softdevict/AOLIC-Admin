import { Link, useLocation, useNavigate } from 'react-router-dom';
import { add_audioTour } from '../../api/config'; // Update this import to your actual API endpoint
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useState, useEffect } from 'react';
import Button from '../../components/button/Button';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CloseIcon from '@mui/icons-material/Close';
type FormData = {
    language: string;
    audioDirectionName: string;
    audioTourModel: string;
    audioDirectionImg?: FileList;
    audioLink?: FileList;
    videoLink: string;
    latitude: number;
    longitude: number;
    audioDirectionText: string;
    directionUserModel: string;
    directionDescription?: string;
    directionusertype?: string;
};

const AddAudioTour: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const {
        language,
        audioDirectionName,
        audioTourModel,
        audioDirectionImg,
        audioLink,
        videoLink,
        latitude,
        longitude,
        audioDirectionText,
        directionUserModel,
        directionDescription,
        directionusertype,
        id,
    } = location.state || {};

    const [imagePreview, setImagePreview] = useState<string | null>(audioDirectionImg || null);
    const [audioPreview, setAudioPreview] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        trigger,
        watch,
        reset,
    } = useForm<FormData>({
        defaultValues: {
            language: language || 'en',
            audioDirectionName: audioDirectionName || '',
            audioTourModel: audioTourModel || 'Walk Tour',
            audioDirectionImg: undefined,
            audioLink: undefined,
            videoLink: videoLink || '',
            latitude: latitude || undefined,
            longitude: longitude || undefined,
            audioDirectionText: audioDirectionText || '',
            directionUserModel: directionUserModel || 'Audio Tour only',
            directionDescription: directionDescription || '',
            directionusertype: directionusertype || 'Both',
        },
    });

    const watchedDirectionUserModel = watch('directionUserModel');

    useEffect(() => {
        setValue('language', language || 'en');
        setValue('audioDirectionName', audioDirectionName || '');
        setValue('audioTourModel', audioTourModel || 'Walk Tour');
        setValue('videoLink', videoLink || '');
        setValue('latitude', latitude || undefined);
        setValue('longitude', longitude || undefined);
        setValue('audioDirectionText', audioDirectionText || '');
        setValue('directionUserModel', directionUserModel || 'Audio Tour only');
        setValue('directionDescription', directionDescription || '');
        setValue('directionusertype', directionusertype || 'Both');
        setImagePreview(audioDirectionImg || null);
    }, [language, audioDirectionName, audioTourModel, videoLink, latitude, longitude, audioDirectionText, directionUserModel, directionDescription, directionusertype, setValue]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
            trigger('audioDirectionImg');
        } else {
            setImagePreview(audioDirectionImg || null);
        }
    };

    const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAudioPreview(URL.createObjectURL(file));
            trigger('audioLink');
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
            formData.append('language', data.language);
            formData.append('audioDirectionName', data.audioDirectionName);
            formData.append('audioTourModel', data.audioTourModel);
            formData.append('latitude', data.latitude.toString());
            formData.append('longitude', data.longitude.toString());
            formData.append('audioDirectionText', data.audioDirectionText);
            formData.append('directionUserModel', data.directionUserModel);

            if (data.audioDirectionImg && data.audioDirectionImg.length > 0) {
                formData.append('audioDirectionImg', data.audioDirectionImg[0]);
            }

            if (data.audioLink && data.audioLink.length > 0) {
                formData.append('audioLink', data.audioLink[0]);
            }

            if (data.videoLink) {
                formData.append('videoLink', data.videoLink);
            }

            // Additional fields for Tour and Maps
            if (data.directionUserModel === 'Tour and Maps') {
                formData.append('directionDescription', data.directionDescription || '');
                formData.append('directionusertype', data.directionusertype || 'Both');
            }

            const url = id ? `${add_audioTour}/${id}` : add_audioTour;
            const method = id ? axios.patch : axios.post;
            const response = await method(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            notify(id ? 'Audio tour updated successfully' : 'Audio tour added successfully');
            reset();
            setImagePreview(null);
            setAudioPreview(null);
            setTimeout(() => navigate('/direction'), 1000);
        } catch (err: any) {
            errorNotify(err.response?.data?.message || 'Failed to process audio tour');
        } finally {
            setLoading(false);
        }
    };

    const audioTourModelOptions = ['Walk Tour'];
    // const audioTourModelOptions = ['Vehicle Tour', 'Walk Tour', 'Video Tour'];
    const selectedAudioTourModel = watch("audioTourModel"); // watch the selected option

    const directionUserModelOptions = ['Audio Tour only', 'Tour and Maps'];
    const directionusertypeOptions = ['Visitor', 'Program Participant', 'Both'];
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
                        <button className="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70">{id ? 'Edit Audio Tour' : 'Add Audio Tour'}</button>
                    </li>
                </ol>
            )}
            <div>
                <div className="relative w-full flex justify-center items-center flex-col bg-white sm:w-[35rem] m-auto rounded-2xl shadow-2xl mt-8">

                    {adminType === "super admin" && (
                        <div className='absolute top-3 right-3 hover:bg-gray-300 rounded-xl  ' onClick={() => {
                            navigate("/direction")
                        }}>
                            <CloseIcon />
                        </div>

                    )}
                    <ToastContainer />
                    <h2 className="text-2xl font-bold m-8 font-cinzel">{id ? 'Edit Audio Tour' : 'Add Audio Tour'}</h2>
                    <form className="flex flex-col p-4 gap-2 w-full m-auto mb-5" onSubmit={handleSubmit(onSubmit)} noValidate>
                        <select className="p-4 border-2 focus:outline-none rounded-lg" {...register('language', { required: 'Language is required' })}>
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
                            <option value="sa">Sanskrit</option>
                            {/* Add more language options as needed */}
                        </select>
                        {errors.language && <span className="text-red-500">{errors.language.message}</span>}

                        <input
                            className="p-4 border-2 focus:outline-none rounded-lg font-poppins"
                            type="text"
                            placeholder="Audio Direction Name"
                            {...register('audioDirectionName', {
                                required: 'Audio direction name is required',
                                maxLength: { value: 80, message: 'Name must be 80 characters or less' },
                            })}
                        />
                        {errors.audioDirectionName && <span className="text-red-500 font-poppins">{errors.audioDirectionName.message}</span>}

                        <select className="p-4 border-2 focus:outline-none rounded-lg" {...register('audioTourModel', { required: 'Please select an audio tour model' })}>
                            <option value="">Select Audio Tour Model</option>
                            {audioTourModelOptions.map((value, index) => (
                                <option key={index} value={value}>
                                    {value}
                                </option>
                            ))}
                        </select>
                        {errors.audioTourModel && <span className="text-red-500">{errors.audioTourModel.message}</span>}
                        <label className="bg-black-light rounded-lg">
                            <input
                                className="p-3 focus:outline-none rounded-lg"
                                type="file"
                                accept="image/*"
                                {...register('audioDirectionImg', {
                                    required: id ? false : 'Image is required',
                                })}
                                onChange={handleImageChange}
                            />
                        </label>
                        {errors.audioDirectionImg && <span className="text-red-500">{errors.audioDirectionImg.message}</span>}
                        {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-48 h-48 object-cover rounded-lg border" />}

                        <input
                            className="p-4 border-2 focus:outline-none rounded-lg font-poppins"
                            type="number"
                            step="any"
                            placeholder="Latitude"
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
                            placeholder="Longitude"
                            {...register('longitude', {
                                required: 'Longitude is required',
                                valueAsNumber: true,
                                min: { value: -180, message: 'Longitude must be between -180 and 180' },
                                max: { value: 180, message: 'Longitude must be between -180 and 180' },
                            })}
                        />
                        {errors.longitude && <span className="text-red-500 font-poppins">{errors.longitude.message}</span>}

                        <textarea
                            className="p-4 border-2 focus:outline-none rounded-lg font-poppins"
                            placeholder="Audio Direction Text"
                            rows={4}
                            {...register('audioDirectionText', {
                                required: 'Audio direction text is required',
                                maxLength: { value: 500, message: 'Text must be 500 characters or less' },
                            })}
                        />
                        {errors.audioDirectionText && <span className="text-red-500 font-poppins">{errors.audioDirectionText.message}</span>}
                        {(selectedAudioTourModel === "Vehicle Tour" || selectedAudioTourModel === "Walk Tour") && (
                            <input className="p-4 border-2 focus:outline-none rounded-lg" type="file" accept="audio/mp3,audio/mpeg" {...register('audioLink')} onChange={handleAudioChange} />)}
                        {errors.audioLink && <span className="text-red-500">{errors.audioLink.message}</span>}
                        {audioPreview && (
                            <audio controls className="mt-2 w-full">
                                <source src={audioPreview} type="audio/mpeg" />
                                Your browser does not support the audio element.
                            </audio>
                        )}

                        {selectedAudioTourModel === "Video Tour" && (
                            <input className="p-4 border-2 focus:outline-none rounded-lg font-poppins" type="text" placeholder="Video Link (Optional)" {...register('videoLink')} />
                        )}
                        <select className="p-4 border-2 focus:outline-none rounded-lg" {...register('directionUserModel', { required: 'Please select a direction user model' })}>
                            {directionUserModelOptions.map((value, index) => (
                                <option key={index} value={value}>
                                    {value}
                                </option>
                            ))}
                        </select>
                        {errors.directionUserModel && <span className="text-red-500">{errors.directionUserModel.message}</span>}

                        {watchedDirectionUserModel === 'Tour and Maps' && (
                            <>
                                <textarea
                                    className="p-4 border-2 focus:outline-none rounded-lg font-poppins"
                                    placeholder="Direction Description"
                                    rows={4}
                                    {...register('directionDescription', {
                                        required: 'Direction description is required for Tour and Maps',
                                        maxLength: { value: 500, message: 'Description must be 500 characters or less' },
                                    })}
                                />
                                {errors.directionDescription && <span className="text-red-500 font-poppins">{errors.directionDescription.message}</span>}

                                <select className="p-4 border-2 focus:outline-none rounded-lg" {...register('directionusertype', { required: 'Please select a user type for Tour and Maps' })}>
                                    <option value="">Select User Type</option>
                                    {directionusertypeOptions.map((value, index) => (
                                        <option key={index} value={value}>
                                            {value}
                                        </option>
                                    ))}
                                </select>
                                {errors.directionusertype && <span className="text-red-500">{errors.directionusertype.message}</span>}
                            </>
                        )}

                        <Button text="Submit" loading={loading} />
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddAudioTour;

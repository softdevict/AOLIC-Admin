import { Link, useLocation, useNavigate } from 'react-router-dom';
import { delete_action, delete_direction, update_action, update_direction } from '../../api/config'; // Adjust if endpoints change
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
    directionImg: FileList;
};

const Directionmodefication: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Extract initial values from location.state
    const { directionName, directionImg, directionDescription, longitude, latitude, _id } = location.state || {};
    console.log(_id, 'id');

    const [imagePreview, setImagePreview] = useState<string | null>(directionImg || null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<FormData>({
        defaultValues: {
            directionName: directionName || '',
            directionDescription: directionDescription || '',
            longitude: longitude || 0,
            latitude: latitude || 0,
        },
    });

    // Update form values when location.state changes
    useEffect(() => {
        setValue('directionName', directionName || '');
        setValue('directionDescription', directionDescription || '');
        setValue('longitude', longitude || 0);
        setValue('latitude', latitude || 0);
    }, [directionName, directionDescription, longitude, latitude, setValue]);

    // Handle image preview
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImagePreview(URL.createObjectURL(file));
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
            formData.append('directionName', data.directionName);
            formData.append('directionDescription', data.directionDescription);
            formData.append('longitude', data.longitude.toString());
            formData.append('latitude', data.latitude.toString());

            if (data.directionImg && data.directionImg.length > 0) {
                formData.append('directionImg', data.directionImg[0]);
            }

            // Debug FormData
            for (const pair of formData.entries()) {
                console.log(pair[0], pair[1]);
            }

            // Send PATCH request
            const response = await axios.patch(`${update_direction}/${_id}`, formData);

            console.log(response.data, 'Updated Successfully');
            notify('Successfully updated');
            setTimeout(() => navigate('/direction'), 1000);
        } catch (err) {
            console.error('Error updating direction:', err);
            errorNotify('Failed to update direction');
        } finally {
            setLoading(false);
        }
    };

    // Handle delete action

    return (
        <div>

                 <ol className="flex text-gray-500 font-semibold dark:text-white-dark space-x-2">
          <li>
            <Link to="/">
              <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Home</button>
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link to="/direction">
              <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Maps and Tours</button>
            </Link>
          </li>
          <li>/</li>
          <li>
            <button className="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70">
              Edit Ashram Maps
            </button>
          </li>
        </ol>
            <div className="relative w-full flex justify-center items-center flex-col bg-white sm:w-[35rem] m-auto rounded-2xl shadow-2xl mt-8">
                
                           <div className='absolute top-3 right-3 hover:bg-gray-300 rounded-xl  ' onClick={()=>{
          navigate("/direction")
        }}>
          <CloseIcon  />
        </div>
                <ToastContainer />
                <h2 className="text-2xl font-bold m-8 font-cinzel">Edit Direction</h2>
                <form className="flex flex-col p-4 gap-2 w-full m-auto mb-5" onSubmit={handleSubmit(onSubmit)}>
                    {/* Direction Name Input */}
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

                    {/* Direction Description Input */}
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

                    {/* Latitude Input */}
                    <input
                        className="p-4 border-2 focus:outline-none rounded-lg font-poppins"
                        type="number"
                        step="any"
                        placeholder="Latitude"
                        {...register('latitude', {
                            required: 'Latitude is required',
                            // min: { value: -90, message: 'Latitude must be between -90 and 90' },
                            // max: { value: 90, message: 'Latitude must be between -90 and 90' },
                            valueAsNumber: true,
                        })}
                    />
                    {errors.latitude && <span className="text-red-500 font-poppins">{errors.latitude.message}</span>}

                    {/* Longitude Input */}
                    <input
                        className="p-4 border-2 focus:outline-none rounded-lg font-poppins"
                        type="number"
                        step="any"
                        placeholder="Longitude"
                        {...register('longitude', {
                            required: 'Longitude is required',
                            // min: { value: -180, message: 'Longitude must be between -180 and 180' },
                            // max: { value: 180, message: 'Longitude must be between -180 and 180' },
                            valueAsNumber: true,
                        })}
                    />
                    {errors.longitude && <span className="text-red-500 font-poppins">{errors.longitude.message}</span>}

                    {/* Image Upload */}
                    <input className="p-3 focus:outline-none rounded-lg font-poppins" type="file" accept="image/*" {...register('directionImg')} onChange={handleImageChange} />
                    {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-48 h-48 object-cover rounded-lg border" />}

                    {/* Buttons */}
                    
                        <Button text="Submit" loading={loading} />
                       
                    
                </form>
            </div>
        </div>
    );
};

export default Directionmodefication;

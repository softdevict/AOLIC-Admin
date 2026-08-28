import { useForm, SubmitHandler } from 'react-hook-form';
import Button from '../../components/button/Button';
import { toast, ToastContainer } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { add_PopUp } from '../../api/config';
import { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import 'react-toastify/dist/ReactToastify.css';

type FormData = {
  img: FileList;
  liveTime: string;
  displayTime1: string;
  displayTime2: string;
};

function PopupForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    defaultValues: {
      displayTime1: '09:00',
      displayTime2: '19:05',
    },
  });

  const displayTime1 = watch('displayTime1');
  const displayTime2 = watch('displayTime2');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const formatTimeToAMPM = (time24: string): string => {
    if (!time24) return '';
    const [hourStr, minute] = time24.split(':');
    const hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${minute} ${ampm}`;
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('img', data.img[0]);

    if (data.liveTime) {
      const [date, time] = data.liveTime.split('T');
      const [year, month, day] = date.split('-');
      const [hour, minute] = time.split(':');
      const formattedTime = `${hour}-${minute}-${day}-${month}-${year}`;
      formData.append('liveTime', formattedTime);
    }

    formData.append('displayTime1', data.displayTime1);
    formData.append('displayTime2', data.displayTime2);

    try {
      console.log(formData, "formData");

      const response = await axios.post(add_PopUp, formData);
      console.log('Response:', response);
      toast.success('Popup created successfully!');
      setTimeout(() => navigate('/popup'), 1000);
    } catch (error) {
      console.error('Error creating popup:', error);
      toast.error('Something went wrong. Please try again!');
    } finally {
      setLoading(false);
    }
  };
  const adminType = localStorage.getItem("adminType");
  return (
    <>
      {/* Breadcrumbs */}
      {adminType === "super admin" && (
        <ol className="flex text-gray-500 font-semibold dark:text-white-dark space-x-2">
          <Link to="/">
            <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Home</button>
          </Link>
          <li>/</li>
          <Link to="/popup">
            <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Popup</button>
          </Link>
          <li>/</li>
          <li>
            <button className="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70">Add</button>
          </li>
        </ol>
      )}
      {/* Toast Notifications */}
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      {/* Form Container */}
      <div
        className="relative w-full flex justify-center items-center flex-col bg-white sm:w-[35rem] m-auto rounded-2xl shadow-2xl mt-8"
        style={{
          borderRadius: '4px',
          boxShadow: 'rgba(97, 75, 66, 0.7) 2px 2px 5px 0px',
        }}
      >
        {/* Close Icon */}
        <div className="absolute top-3 right-3 hover:bg-gray-300 rounded-xl cursor-pointer" onClick={() => navigate('/popup')}>
          <CloseIcon />
        </div>

        {/* Form Title */}
        <h2 className="text-2xl font-bold m-8 font-cinzel">Add New Popup</h2>

        {/* Form */}
        <form
          className="flex flex-col p-4 gap-4 w-full m-auto mb-5"
          onSubmit={handleSubmit(onSubmit)}
          encType="multipart/form-data"
        >
          {/* Image Upload */}
          <label>
            <input
              type="file"
              className="p-4 rounded-lg border w-full"
              {...register('img', { required: 'Image is required' })}
              onChange={handleImageChange}
            />
          </label>
          {errors.img && <p className="text-red-500">{errors.img.message}</p>}
          {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-48 h-48 object-cover rounded-lg border" />}

          {/* Live Time Picker */}
          <label>
            <input
              type="datetime-local"
              className="p-4 rounded-lg border w-full"
              {...register('liveTime')}
            />
          </label>
          {errors.liveTime && <p className="text-red-500">{errors.liveTime.message}</p>}

          {/* Display Time 1 */}
          <label>
            <input
              type="time"
              className="p-4 rounded-lg border w-full"
              {...register('displayTime1', { required: 'Start time is required' })}
            />
            <p className="mt-1 text-sm text-gray-600">Selected: {formatTimeToAMPM(displayTime1)}</p>
          </label>
          {errors.displayTime1 && <p className="text-red-500">{errors.displayTime1.message}</p>}

          {/* Display Time 2 */}
          <label>
            <input
              type="time"
              className="p-4 rounded-lg border w-full"
              {...register('displayTime2', { required: 'End time is required' })}
            />
            <p className="mt-1 text-sm text-gray-600">Selected: {formatTimeToAMPM(displayTime2)}</p>
          </label>
          {errors.displayTime2 && <p className="text-red-500">{errors.displayTime2.message}</p>}

          {/* Submit Button */}
          <Button text="Submit" loading={loading} />
        </form>
      </div>
    </>
  );
}

export default PopupForm;

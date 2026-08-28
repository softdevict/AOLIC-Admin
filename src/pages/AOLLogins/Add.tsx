import axios, { AxiosError } from 'axios';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Button from '../../components/button/Button';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CloseIcon from '@mui/icons-material/Close';

import { create_user_type } from '../../api/config';

type FormData = {
  usertype: string;
  link: string;
  img?: FileList;
};

function AolLoginAdd() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>();

  const watchImage = watch('img');

  useEffect(() => {
    if (watchImage?.[0]) {
      const file = watchImage[0];
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      return () => URL.revokeObjectURL(previewUrl);
    }
  }, [watchImage]);

  const notify = {
    success: (msg: string) => toast.success(msg),
    error: (msg: string) => toast.error(msg),
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const formData = new FormData();
    formData.append('usertype', data.usertype);
    formData.append('link', data.link);
    if (data.img?.[0]) {
      formData.append('img', data.img[0]);
    }

    try {
      setLoading(true);
      await axios.post(create_user_type, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      notify.success('User type created successfully!');
      reset();
      setImagePreview(null);
      setTimeout(() => navigate('/aol-logins/display'), 1000);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      notify.error(axiosError.response?.data?.message || 'Creation failed.');
    } finally {
      setLoading(false);
    }
  };
  const adminType = localStorage.getItem("adminType");
  return (
    <>
      {adminType === "super admin" && (
        <ol className="flex text-gray-500 font-semibold dark:text-white-dark space-x-2">
          <Link to="/">
            <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Home</button>
          </Link>
          <li>/</li>
          <Link to="/aol-logins/display">
            <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">AOL Logins</button>
          </Link>
          <li>/</li>
          <li>
            <button className="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70">
              Create User Type
            </button>
          </li>
        </ol>
      )}
      <div className="min-h-screen py-8 bg-gray-50 ">

        <ToastContainer />
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8 relative">
            <div className='absolute top-3 right-3 hover:bg-gray-300 rounded-xl  ' onClick={() => {
              navigate("/aol-logins/display")
            }}>
              <CloseIcon />
            </div>
            <h2 className="text-2xl font-bold text-center mb-6">Create AOL Login Form</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input
                type="text"
                placeholder="User Type"
                className={`w-full p-3 border rounded-lg ${errors.usertype ? 'border-red-500' : 'border-gray-300'
                  }`}
                {...register('usertype', {
                  required: 'User type is required',
                  maxLength: { value: 50, message: 'Max 50 characters' },
                })}
              />
              {errors.usertype && <p className="text-red-500 text-sm">{errors.usertype.message}</p>}

              <input
                type="text"
                placeholder="Link (https://...)"
                className={`w-full p-3 border rounded-lg ${errors.link ? 'border-red-500' : 'border-gray-300'
                  }`}
                {...register('link', {
                  required: 'Link is required',
                  pattern: {
                    value: /^https?:\/\//,
                    message: 'Must be a valid URL (http/https)',
                  },
                })}
              />
              {errors.link && <p className="text-red-500 text-sm">{errors.link.message}</p>}

              <input
                type="file"
                accept="image/*"
                className="w-full p-2 border rounded-lg"
                {...register('img', {
                  required: 'Image is required',
                })}
              />
              {errors.img && <p className="text-red-500 text-sm">{errors.img.message}</p>}

              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-48 h-48 object-cover mt-2 rounded-lg border"
                />
              )}

              <Button text="Submit" loading={loading} />
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default AolLoginAdd;

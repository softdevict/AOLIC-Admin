import axios, { AxiosError } from 'axios';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Button from '../../components/button/Button';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { update_user_type } from '../../api/config';
import CloseIcon from '@mui/icons-material/Close';

type FormData = {
  usertype: string;
  name: string;
  link: string;
  img?: FileList;
};

type LocationState = {
  name: string;
  img: string;
  link: string;
  id: string;
};

function AolLoginEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state as LocationState;

  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(editData.img || null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    defaultValues: {
      usertype: editData.name,
      link: editData.link,
    },
  });

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
      await axios.patch(`${update_user_type}/${editData.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      notify.success('User type updated successfully!');
      setTimeout(() => navigate('/aol-logins/display'), 1000);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      notify.error(axiosError.response?.data?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />

      <nav className="flex text-gray-500 font-semibold dark:text-white-dark space-x-2 mb-4">
        <Link to="/" className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Home</Link>
        <span>/</span>
        <Link to="/aol-logins/display" className="hover:text-gray-500/70 dark:hover:text-white-dark/70">AOL Logins</Link>
        <span>/</span>
        <span className="text-black dark:text-white-light">Edit User Type</span>
      </nav>

      <div className="min-h-screen py-8 bg-gray-50">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-8 relative">
                      <div className='absolute top-3 right-3 hover:bg-gray-300 rounded-xl  ' onClick={()=>{
          navigate("/aol-logins/display")
        }}>
          <CloseIcon  />
        </div>
            <h2 className="text-2xl font-bold text-center mb-6">Edit AOL Login Form</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input
                type="text"
                placeholder="User Type"
                className={`w-full p-3 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                {...register('usertype', {
                  required: 'User type is required',
                  maxLength: { value: 50, message: 'Max 50 characters' },
                })}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}

              <input
                type="text"
                placeholder="Link (https://...)"
                className={`w-full p-3 border rounded-lg ${errors.link ? 'border-red-500' : 'border-gray-300'}`}
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
                {...register('img')}
              />

              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-48 h-48 object-cover mt-2 rounded-lg border"
                />
              )}

              <Button text="Save Changes" loading={loading} />
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default AolLoginEdit;

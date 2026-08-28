import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useState, useEffect } from 'react';

import { delete_card, update_card } from '../../api/config';
import Button from '../../components/button/Button';
import DeleteButton from '../../components/button/DelButton';
import CloseIcon from '@mui/icons-material/Close';


import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type FormData = {
  name: string;
  link: string;
  img: FileList;
};

const HomeEdit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialData = location.state || {};

  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.img || null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: initialData.name || '',
      link: initialData.link || '',
    },
  });

  useEffect(() => {
    if (initialData.name) setValue('name', initialData.name);
    if (initialData.link) setValue('link', initialData.link);
  }, [initialData, setValue]);

  const notifySuccess = (msg: string) => toast.success(msg);
  const notifyError = (msg: string) => toast.error(msg);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('link', data.link);
    if (data.img?.[0]) {
      formData.append('img', data.img[0]);
    }

    try {
      const response = await axios.patch(`${update_card}/${initialData.id}`, formData);
      console.log('Update success:', response);
      notifySuccess('Card updated successfully!');
      setTimeout(() => navigate('/HomeCard'), 1000);
    } catch (error) {
      console.error('Update error:', error);
      notifyError('Failed to update card.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <ol className="flex text-gray-500 font-semibold dark:text-white-dark space-x-2">
        <Link to="/">
          <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Home</button>
        </Link>
        <li>/</li>
        <li>
          <button className="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70">
            Edit
          </button>
        </li>
      </ol>

      <div className="flex justify-center items-center mt-1 px-4">
        <ToastContainer position="top-right" autoClose={2000} />
        <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg relative">
          <div className='absolute top-5 right-5 hover:bg-gray-300 rounded-xl ' onClick={() => {
            navigate("/HomeCard")
          }}>
            <CloseIcon />
          </div>
          <h2 className="text-2xl font-bold text-center mb-6 font-cinzel">Edit Card</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Name"
              className="p-3 border rounded-lg focus:outline-none"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}

            <input
              type="text"
              placeholder="Link"
              className="p-3 border rounded-lg focus:outline-none"
              {...register('link', {
                required: 'Link is required',
                pattern: {
                  value: /^https:\/\//,
                  message: 'Link must start with https://',
                },
              })}
            />
            {errors.link && <p className="text-red-500 text-sm">{errors.link.message}</p>}

            <input
              type="file"
              accept="image/*"
              className="p-3 border rounded-lg focus:outline-none"
              {...register('img')}
              onChange={handleImageChange}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-40 h-40 object-cover mt-2 rounded-lg border mx-auto"
              />
            )}

            {/* <div className=""> */}
            {/* <DeleteButton text="Delete" loading={loading} onClick={handleDelete} /> */}
            <Button text="Submit" loading={loading} />
            {/* </div> */}
          </form>
        </div>
      </div>
    </>
  );
};

export default HomeEdit;

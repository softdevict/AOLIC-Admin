import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../../components/button/Button';
import axios from 'axios';
import { create_card, display_all_head } from '../../api/config';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import CloseIcon from '@mui/icons-material/Close';


type Headline = {
  headline: string;
};

type FormData = {
  headline: string;
  name: string;
  link: string;
  img: FileList;
};

function HomeAdd() {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [headlines, setHeadlines] = useState<Headline[]>([]);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const notify = (msg: string) => toast.success(msg);

  const onSubmit = (data: FormData) => {
    setLoading(true);

    const formData = new FormData();
    formData.append('headline', data.headline);
    formData.append('name', data.name);
    formData.append('link', data.link);
    formData.append('img', data.img[0]);

    axios
      .post(create_card, formData)
      .then((response) => {
        console.log(response, 'success');
        notify('Card created successfully!');

        setTimeout(() => navigate('/HomeCard'), 1000);
      })
      .catch((err: any) => {
        console.error(err);
        const backendMessage = err?.response?.data?.message || 'Something went wrong!';
        toast.error(backendMessage);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    axios
      .get(display_all_head)
      .then((response) => {
        setHeadlines(response.data.headlines);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);
  const adminType = localStorage.getItem("adminType");
  // console.log("🚀 ~ HomeAdd ~ adminType:", adminType)

  return (
    <>
      {adminType === "super admin" && (
        < ol className="flex text-gray-500 font-semibold dark:text-white-dark space-x-2">
          <Link to="/">
            <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70"

            >Home</button>
          </Link>
          <li>/</li>
          <li>
            <button className="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70">Add</button>
          </li>
        </ol >
      )
      }
      <div
        className="w-full flex justify-center items-center flex-col bg-white sm:w-[35rem] m-auto rounded-2xl shadow-2xl mt-8 relative"
        style={{
          borderRadius: '4px',
          boxShadow: 'rgba(97, 75, 66, 0.7) 2px 2px 5px 0px',
        }}
      >
        <ToastContainer />
        <div className='absolute top-5 right-5 hover:bg-gray-300 rounded-xl ' onClick={() => {
          navigate("/HomeCard")
        }}>
          <CloseIcon />
        </div>
        <h2 className="text-2xl font-bold m-8 font-cinzel">Create New Card</h2>
        <form className="w-full flex flex-col p-4 gap-2" onSubmit={handleSubmit(onSubmit)}>
          <input className="p-4 border-2 focus:outline-none rounded-lg" type="text" placeholder="Name" {...register('name', { required: 'Name is required' })} />
          {errors.name && <span className="text-red-500">{errors.name.message}</span>}

          <input
            className="p-4 border-2 focus:outline-none rounded-lg"
            type="text"
            placeholder="Link"
            {...register('link', {
              required: 'Link is required',
              pattern: {
                value: /^https:\/\//,
                message: 'Please enter a valid URL (starting with https://)',
              },
            })}
          />
          {errors.link && <span className="text-red-500">{errors.link.message}</span>}

          <select className="p-4 border-2 focus:outline-none rounded-lg" {...register('headline', { required: 'Headline is required' })}>
            <option value="">Select a Headline</option>
            {headlines?.map((item, index) => (
              <option key={index} value={item.headline}>
                {item.headline}
              </option>
            ))}
          </select>
          {errors.headline && <span className="text-red-500">{errors.headline.message}</span>}

          <label className="bg-black-light rounded-lg">
            <input className="p-3 focus:outline-none rounded-lg" type="file" {...register('img', { required: 'Image is required' })} onChange={handleImageChange} />
          </label>
          {errors.img && <span className="text-red-500">{errors.img.message}</span>}
          {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-48 h-48 object-cover rounded-lg border" />}

          <Button text="Submit" loading={loading} />
        </form>
      </div>
    </>
  );
}

export default HomeAdd;

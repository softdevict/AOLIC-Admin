import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { audioTourName, static_audioTour } from '../../api/config';
import axios from 'axios';
import Button from '../../components/button/Button';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DeleteButton from '../../components/button/DelButton';
import CloseIcon from '@mui/icons-material/Close';

type FormData = {
  audioDirectionName: string;
  audioDirectionImg?: FileList;
  audioLink?: FileList;
  audioDirectionText: string;
  _id?: string;
};

const StaticAudioTourForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [audioNames, setAudioNames] = useState<{ _id: string; audioDirectionName: string }[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  console.log("🚀 ~ StaticAudioTourForm ~ location:", location)

  // Safely extract state
  const locationState = location.state as Partial<FormData> | null;

  const audioDirectionName = locationState?.audioDirectionName || '';
  const audioDirectionText = locationState?.audioDirectionText || '';
  const audioDirectionImg = locationState?.audioDirectionImg;
  const audioLink = locationState?.audioLink;
  const _id = locationState?._id || '';

  console.log("🚀 ~ StaticAudioTourForm ~ _id:", _id);

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      audioDirectionName,
      audioDirectionText,
      _id,
    },
  });

  // Fetch names for dropdown
  useEffect(() => {
    axios.get(audioTourName).then((res) => {
      console.log("Audio tour names:", res.data);
      setAudioNames(res.data.data || []);
    });
  }, []);

  // Pre-fill previews if editing
  useEffect(() => {
    if (audioDirectionImg && typeof audioDirectionImg === 'string') {
      setImagePreview(audioDirectionImg);
    }
    if (audioLink && typeof audioLink === 'string') {
      setAudioPreview(audioLink);
    }
  }, [audioDirectionImg, audioLink]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      trigger('audioDirectionImg');
    }
  };

  // const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     setAudioPreview(URL.createObjectURL(file));
  //     trigger('audioLink');
  //   }
  // };
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Clean up old object URL
      if (audioPreview) {
        URL.revokeObjectURL(audioPreview);
      }
      const newAudioUrl = URL.createObjectURL(file);
      setAudioPreview(newAudioUrl);
      trigger('audioLink');
    }
  };


  const notify = (msg: string) => toast.success(msg);
  const errorNotify = (msg: string) => toast.error(msg);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const formData = new FormData();
      {
        _id ?
          ""
          :
          formData.append('audioDirectionName', data.audioDirectionName);
      }
      formData.append('audioDirectionText', data.audioDirectionText);

      if (data.audioDirectionImg?.[0]) {
        formData.append('audioDirectionImg', data.audioDirectionImg[0]);
      }
      if (data.audioLink?.[0]) {
        formData.append('audioLink', data.audioLink[0]);
      }

      const url = _id ? `${static_audioTour}/${_id}` : static_audioTour;
      const method = _id ? axios.patch : axios.post;

      await method(url, formData);

      notify(_id ? 'Updated successfully' : 'Created successfully');
      reset();
      setTimeout(() => navigate('/direction'), 1500);
    } catch (error: any) {
      errorNotify(error.response?.data?.message || 'Failed to submit form');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`${static_audioTour}/${_id}`);
      toast.success('Deleted successfully');
      setTimeout(() => navigate('/direction'), 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  const adminType = localStorage.getItem("adminType");
  return (
    <>
      <ToastContainer />
      {adminType === "super admin" && (
        <ol className="flex text-gray-500 font-semibold space-x-2">
          <Link to="/"><button>Home</button></Link>
          <li>/</li>
          <Link to="/direction"><button>Map and Tour</button></Link>
          <li>/</li>
          <li><button>{_id ? 'Edit Audio Guide' : 'Add Audio Guide'}</button></li>
        </ol>)}

      <div className="relative w-full sm:w-[35rem] m-auto mt-8 p-6 bg-white rounded-2xl shadow-2xl">
        {adminType === "super admin" && (
          <div className='absolute top-3 right-3 hover:bg-gray-300 rounded-xl  ' onClick={() => {
            navigate("/direction")
          }}>
            <CloseIcon />
          </div>
        )}
        <h2 className="text-2xl font-bold mb-6 text-center">{_id ? 'Edit Audio Guide' : 'Add Audio Guide'}</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>

          {/* Dropdown or static name */}
          {_id ? (
            <div className="p-4 border-2 rounded-lg bg-gray-100 text-gray-700">
              {audioDirectionName}
            </div>
          ) : (
            <>
              <select
                className="p-4 border-2 rounded-lg"
                {...register('audioDirectionName', { required: 'Audio Direction Name is required' })}
              >
                <option value="">Select Audio Direction Name</option>
                {audioNames.map((item) => (
                  <option key={item._id} value={item._id}>{item.audioDirectionName}</option>
                ))}
              </select>
              {errors.audioDirectionName && (
                <p className="text-red-500">{errors.audioDirectionName.message}</p>
              )}
            </>
          )}

          {/* Textarea for Audio Direction Text */}
          <textarea
            className="p-4 border-2 rounded-lg"
            placeholder="Audio Direction Text"
            rows={4}
            {...register('audioDirectionText', {
              required: 'Audio Direction Text is required',
              maxLength: { value: 500, message: 'Max 500 characters' },
            })}
          />
          {errors.audioDirectionText && <p className="text-red-500">{errors.audioDirectionText.message}</p>}

          {/* Image Upload */}
          <input
            type="file"
            accept="image/*"
            {...register('audioDirectionImg', { required: !_id && 'Image is required' })}
            onChange={handleImageChange}
          />
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="w-48 h-48 object-cover rounded-lg border" />
          )}

          {/* Audio Upload */}
          <input
            type="file"
            accept="audio/*"
            {...register('audioLink')}
            onChange={handleAudioChange}
          />
          {audioPreview && (
            <audio key={audioPreview} controls className="w-full mt-2">
              <source src={audioPreview} />
              Your browser does not support the audio element.
            </audio>
          )}

          <div className='flex justify-between'>

            <Button text="Submit" loading={loading} />
          </div>

        </form>
      </div>
    </>
  );
};

export default StaticAudioTourForm;

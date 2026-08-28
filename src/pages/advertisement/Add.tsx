import axios from 'axios';
import { useForm, SubmitHandler } from 'react-hook-form';
import { advertisement } from '../../api/config';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Button from '../../components/button/Button';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CloseIcon from '@mui/icons-material/Close';

interface FormData {
  title1: string;
  link1: string;
  img1: FileList;
  title2: string;
  link2: string;
  img2: FileList;
  title3: string;
  link3: string;
  img3: FileList;
}

interface EditState {
  isEdit: boolean;
  id: string;
  data: {
    title1: string;
    link1: string;
    img1: string;
    title2: string;
    link2: string;
    img2: string;
    title3: string;
    link3: string;
    img3: string;
  };
}

function AdvertisementAdd() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as EditState | null;
  const isEdit = state?.isEdit;

  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [imagePreview, setImagePreview] = useState<Record<string, string>>({
    img1: state?.data?.img1 || '',
    img2: state?.data?.img2 || '',
    img3: state?.data?.img3 || '',
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<FormData>();

  const notify = (msg: string) => toast.success(msg);
  const notifyError = (msg: string) => toast.error(msg);

  useEffect(() => {
    if (isEdit && state?.data) {
      ['1', '2', '3'].forEach((num) => {
        const titleKey = `title${num}` as keyof FormData;
        const linkKey = `link${num}` as keyof FormData;
        setValue(titleKey, state.data[titleKey]);
        setValue(linkKey, state.data[linkKey]);
      });
    }
  }, [isEdit, setValue, state]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview((prev) => ({ ...prev, [key]: url }));
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const formData = new FormData();
 

    [1, 2, 3].forEach((num) => {
      const titleKey = `title${num}` as keyof FormData;
      const linkKey = `link${num}` as keyof FormData;
      const imgKey = `img${num}` as keyof FormData;

      const title = data[titleKey];
      const link = data[linkKey];
      const imgFileList = data[imgKey];

      if (typeof title === 'string') {
        formData.append(titleKey, title);
      }

      if (typeof link === 'string') {
        formData.append(linkKey, link);
      }

      if (imgFileList instanceof FileList && imgFileList.length > 0) {
        formData.append(imgKey, imgFileList[0]);
      }
      
    });
   console.log("🚀 ~ onSubmit ~ formData:", formData)
    try {
      setLoading1(true);
      if (isEdit && state?.id) {
        await axios.patch(`${advertisement}/${state.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        notify('Upcoming Programs updated successfully!');
      } else {
        await axios.post(advertisement, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        notify('Upcoming Programs created successfully!');
      }

      reset();
      setTimeout(() => navigate('/advertisement'), 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Operation failed';
      notifyError(msg);
    } finally {
      setLoading1(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <ol className="flex text-gray-500 font-semibold dark:text-white-dark space-x-2">
        <Link to="/"><button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Home</button></Link>
        <li>/</li>
        <Link to="/advertisement"><button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Upcoming Programs</button></Link>
        <li>/</li>
        <li><button className="text-black dark:text-white-light">Create Upcoming Programs</button></li>
      </ol>

      <div className="relative w-full flex justify-center items-center flex-col bg-white sm:w-[35rem] m-auto rounded-2xl shadow-2xl mt-8 p-4">
              <div className='absolute top-3 right-3 hover:bg-gray-300 rounded-xl  ' onClick={()=>{
          navigate("/advertisement")
        }}>
          <CloseIcon  />
        </div>
        <h2 className="text-2xl font-bold font-cinzel mb-6">Create Upcoming Programs</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">
          {[1, 2, 3].map((num) => {
            const imgKey = `img${num}` as keyof FormData;
            const titleKey = `title${num}` as keyof FormData;
            const linkKey = `link${num}` as keyof FormData;

            return (
              <fieldset key={num} className="p-4 rounded-lg">
                <legend className="font-bold mb-2">Upcoming Programs {num}</legend>
                <input
                  type="text"
                  placeholder={`Title ${num}`}
                  className="p-2 border rounded w-full mb-2"
                  {...register(titleKey, { required: 'Title is required' })}
                />
                {errors[titleKey] && <p className="text-red-500">{errors[titleKey]?.message}</p>}

                <input
                  type="text"
                  placeholder={`Link ${num}`}
                  className="p-2 border rounded w-full mb-2"
                  {...register(linkKey, {
                    required: 'Link is required',
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: 'Enter a valid URL',
                    },
                  })}
                />
                {errors[linkKey] && <p className="text-red-500">{errors[linkKey]?.message}</p>}

                <input
                  type="file"
                  accept="image/*"
                  className="p-2 border rounded w-full mb-2"
                  {...register(imgKey)}
                  onChange={(e) => handleImageChange(e, imgKey)}
                />
                {imagePreview[imgKey] && (
                  <img src={imagePreview[imgKey]} alt={`Preview ${num}`} className="w-40 h-40 object-cover rounded-lg" />
                )}
              </fieldset>
            );
          })}

          <div className="flex justify-center mt-4 gap-4">
            <Button text={isEdit ? 'Update' : 'Submit'} loading={loading1} />
        
          </div>
        </form>
      </div>
    </>
  );
}

export default AdvertisementAdd;



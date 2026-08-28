import axios from 'axios';
import { useEffect, useState } from 'react';
import { useForm, SubmitHandler, useFieldArray } from 'react-hook-form';
import { add_action, display_all_user_type } from '../../api/config';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/button/Button';
import { ToastContainer, toast } from 'react-toastify';

// Action object for each field
type ActionItem = {
    action: string;
    link: string;
    img: FileList | null;
};

// Main form data
type FormData = {
    language: string;
    usertype: string;
    actions: ActionItem[];
};

// Props
interface ActionFormProps {
    head: { headline: string }[];
}

function ActionForm({ head }: ActionFormProps) {
    const [loading, setLoading] = useState(false);
    const [userType, setUserType] = useState<{ usertype: string }[]>([]);
    const [previews, setPreviews] = useState<{ [key: number]: string }>({});

    const language = ['English'];
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
        setValue,
        watch,
    } = useForm<FormData>({
        defaultValues: {
            actions: [{ action: '', link: '', img: null }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'actions',
    });

    useEffect(() => {
        axios
            .get(display_all_user_type)
            .then((response) => setUserType(response.data))
            .catch((err) => console.error('Error fetching user types:', err));
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (file) {
            setValue(`actions.${index}.img`, e.target.files);
            setPreviews((prev) => ({ ...prev, [index]: URL.createObjectURL(file) }));
        }
    };

    const notify = (msg: string) => toast.success(msg);

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        // Check if at least one action is provided (not empty)
        const hasValidAction = data.actions.some((item) => item.action.trim() !== '' || item.link.trim() !== '' || (item.img && item.img.length > 0));

        if (!hasValidAction) {
            toast.error('Please provide at least one valid action.');
            return;
        }

        const requests = data.actions.map(async (item) => {
            const formData = new FormData();
            formData.append('language', data.language);
            formData.append('usertype', data.usertype);
            formData.append('action', item.action);
            formData.append('link', item.link);
            if (item.img && item.img.length > 0) {
                formData.append('img', item.img[0]);
            }
            return axios.post(add_action, formData);
        });

        try {
            setLoading(true);
            await Promise.all(requests);
            notify('Created successfully!');
            setTimeout(() => navigate('/user_type'), 1000);
        } catch (err: any) {
            const backendMessage = err?.response?.data?.message || 'Something went wrong!';
            toast.error(backendMessage);
        } finally {
            setLoading(false);
        }
    };



    return (
        <div
            className="w-full flex justify-center items-center flex-col bg-white sm:w-[35rem] m-auto rounded-2xl shadow-2xl mt-8"
            style={{
                borderRadius: '4px',
                boxShadow: 'rgba(97, 75, 66, 0.7) 2px 2px 5px 0px',
            }}
        >
            <ToastContainer />
            <h2 className="text-2xl font-bold m-8 font-cinzel">Add Actions</h2>

            <form className="flex flex-col p-4 gap-2 w-full m-auto mb-5" onSubmit={handleSubmit(onSubmit)}>
           
                {/* Select User Type */}
                <select className="p-4 border-2 focus:outline-none rounded-lg font-poppins" {...register('usertype', { required: 'Please select a user type' })}>
                    <option value="">Select a User Type</option>
                    {userType.map((user, index) => (
                        <option key={index} value={user.usertype}>
                            {user.usertype}
                        </option>
                    ))}
                </select>
                {errors.usertype && <span className="text-red-500 font-poppins">{errors.usertype.message}</span>}

                {/* Dynamic Actions */}
                {fields.map((field, index) => (
                    <div key={field.id} className="border p-4 rounded bg-white mb-2 relative">
                        {/* Action Title */}
                        <input
                            type="text"
                            placeholder="Enter Action Title"
                            className="p-3 border-2 rounded-lg w-full mb-2 font-poppins"
                            {...register(`actions.${index}.action`, { required: 'Action title is required' })}
                        />
                        {errors.actions?.[index]?.action && <span className="text-red-500 font-poppins">{errors.actions[index]?.action?.message}</span>}

                        {/* Link */}
                        <input
                            type="text"
                            placeholder="Enter Link"
                            className="p-3 border-2 rounded-lg w-full mb-2 font-poppins"
                            {...register(`actions.${index}.link`, {
                                required: 'Link is required',
                                pattern: {
                                    value: /^https?:\/\//,
                                    message: 'Please enter a valid URL (starting with https://)',
                                },
                            })}
                        />
                        {errors.actions?.[index]?.link && <span className="text-red-500 font-poppins">{errors.actions[index]?.link?.message}</span>}

                        {/* Image Input */}
                        <input type="file" className="p-3 border-2 rounded-lg w-full font-poppins" onChange={(e) => handleImageChange(e, index)} />
                        {errors.actions?.[index]?.img && <span className="text-red-500 font-poppins">{errors.actions[index]?.img?.message}</span>}
                        {/* Preview Image */}
                        {previews[index] && <img src={previews[index]} alt="Preview" className="mt-2 w-48 h-48 object-cover rounded-lg border" />}

                        {/* Remove Button */}
                        <button
                            type="button"
                            className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-poppins"
                            onClick={() => {
                                remove(index);
                                const updatedPreviews = { ...previews };
                                delete updatedPreviews[index];
                                setPreviews(updatedPreviews);
                            }}
                        >
                            Remove
                        </button>
                    </div>
                ))}

                {/* Add Action */}
                <button type="button" className="p-2 bg-gray-500 text-white rounded font-poppins" onClick={() => append({ action: '', link: '', img: null })}>
                    Add Another Action
                </button>

                {/* Submit */}
                <Button text="Submit" loading={loading} />
            </form>
        </div>
    );
}

export default ActionForm;

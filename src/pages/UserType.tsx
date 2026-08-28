import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { display_all_user_type } from '../api/config';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EditIcon from '@mui/icons-material/Edit';

type UserTypeData = {
    _id: string;
    usertype: string;
    img?: string;
    link?: string;
};

const UserType = () => {
    const [items, setItems] = useState<UserTypeData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    const notify = {
        success: (msg: string) => toast.success(msg),
        error: (msg: string) => toast.error(msg),
        info: (msg: string) => toast.info(msg),
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(display_all_user_type);
                setItems(data || []);
            } catch (error) {
                console.error('Error fetching user types:', error);
                notify.error('Failed to load user types');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleEdit = (item: UserTypeData) => {
        navigate('/editUserTypeForm', { state: item });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <ToastContainer position="top-right" autoClose={3000} />

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={`skeleton-${i}`} className="bg-white rounded-lg shadow-md p-4">
                            <Skeleton height={120} width="100%" className="mb-4 rounded-full" />
                            <Skeleton height={24} width="80%" className="mx-auto" />
                        </div>
                    ))}
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-xl text-gray-600">No user types found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {items.map((item) => (
                        <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative">
                            <div className="p-4 flex flex-col items-center">
                                <img
                                    src={item.img || 'https://via.placeholder.com/150'}
                                    alt={item.usertype}
                                    className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-gray-200"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                                    }}
                                />
                                <h3 className="text-lg font-medium text-center text-gray-800 mb-2 cursor-pointer hover:text-blue-600">{item.usertype}</h3>

                                <div className="absolute top-3 right-3 flex gap-2">
                                    <button onClick={() => handleEdit(item)} className="p-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors" aria-label="Edit">
                                        <EditIcon fontSize="small" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserType;

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';

import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { delete_user_type, display_all_user_type } from '../../api/config';
import NavButton from '../../components/button/NavButton';
import AolLoginCard from '../../components/cards/AolLoginCard';
import Card from '../../components/cards/Card';
import AddIcon from '@mui/icons-material/Add';

type UserTypeData = {
  _id: string;
  usertype: string;
  img?: string;
  link?: string;
};

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/150';

const AOLLoginDisplay = () => {
  const [items, setItems] = useState<UserTypeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const notify = {
    success: (msg: string) => toast.success(msg),
    error: (msg: string) => toast.error(msg),
  };

  useEffect(() => {
    const fetchUserTypes = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(display_all_user_type);
        console.log("🚀 ~ fetchUserTypes ~ data:", data)
        setItems(data || []);
      } catch (error) {
        console.error('Error fetching user types:', error);
        notify.error('Failed to load user types');
      } finally {
        setLoading(false);
      }
    };

    fetchUserTypes();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this user type?');
    if (!confirmed) return;

    try {
      setLoading(true);
      await axios.delete(`${delete_user_type}/${id}`);
      notify.success('User type deleted successfully!');
      setItems((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      notify.error(axiosError.response?.data?.message || 'Failed to delete user type');
    } finally {
      setLoading(false);
    }
  };

  const renderSkeletonCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-4">
          <Skeleton height={120} width="100%" className="mb-4 rounded-full" />
          <Skeleton height={24} width="80%" className="mx-auto" />
        </div>
      ))}
    </div>
  );
  const adminType = localStorage.getItem("adminType");
  return (
    <>
      {adminType === "super admin" && (
        <ol className="flex text-gray-500 font-semibold dark:text-white-dark space-x-2">
          <Link to="/">
            <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Home</button>
          </Link>
          <li>/</li>
          <li>
            <button className="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70">
              AOL Logins
            </button>
          </li>
        </ol>
      )}
      <div className="container mx-auto px-4 py-8">
        <ToastContainer position="top-right" autoClose={3000} />

        {adminType === "super admin" && (
          <div className="flex justify-end mb-4">
            <NavButton to="/aol-logins/add"> <AddIcon />
              Create AOL Login Cards
              {/* Create <span className='ml-1 md:block hidden'>AOL Login Cards</span>  */}
            </NavButton>
          </div>
        )}

        {loading ? (
          renderSkeletonCards()
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No user types found</p>
          </div>
        ) : (
          <div className="flex gap-4 flex-wrap justify-center pb-12">
            {items.map((item) => (
              <Card
                key={item._id}
                id={item._id}
                name={item.usertype}
                img={item.img || PLACEHOLDER_IMAGE}
                link={item.link}
                editUrl="/aol-logins/edit"
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AOLLoginDisplay;
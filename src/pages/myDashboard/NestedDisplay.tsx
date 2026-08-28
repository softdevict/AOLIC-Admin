
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { nested_my_dashboard_api, all_nested_my_dashboard_api } from '../../api/config';
import NavButton from '../../components/button/NavButton';
import NestedDashboardCard from '../../components/cards/NestedDashboardCard';
import { Typography } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import AddIcon from '@mui/icons-material/Add';

interface CardData {
  name: string;
  link: string;
  img: string;
  _id: string;
}

function NestedDisplay() {
  const navigate = useNavigate();
  const location = useLocation();
  const id = location.state?.id;
  // console.log("🚀 ~ NestedDisplay ~ id:", id)
  const name = location.state?.name || 'Sub Dashboard';

  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState(true);
  const notifySuccess = (msg: string) => toast.success(msg);
  useEffect(() => {
    if (!id) {
      console.error('Missing dashboard ID in state.');
      navigate('/my_dashboard');
      return;
    }

    const fetchCards = async () => {
      try {
        const response = await axios.get(`${all_nested_my_dashboard_api}/${id}`);
        console.log("🚀 ~ fetchCards ~ response:", response)
        setCards(response.data.data || []);
      } catch (error) {
        console.error('Error fetching dashboard cards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [id, navigate]);

  const deleteHandler = (cardId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this card?');
    if (!confirmDelete) return;
    axios
      .delete(`${nested_my_dashboard_api}/${cardId}`)
      .then(() => {
        notifySuccess('Card deleted successfully!');
        setCards((prev) => prev.filter((card) => card._id !== cardId));
      })
      .catch((error) => {
        console.error('Error deleting dashboard card:', error);
      });
  };

  return (
    <div className="">
      {/* Breadcrumbs */}
      <ol className="flex text-gray-500 font-semibold dark:text-white-dark space-x-2 mb-4">
        <li>
          <Link to="/" className="hover:text-gray-700 dark:hover:text-white-dark/70">
            Home
          </Link>
        </li>
        <li>/</li>
        <li>
          <Link to="/my_dashboard" className="hover:text-gray-700 dark:hover:text-white-dark/70">
            My Dashboard
          </Link>
        </li>
        <li>/</li>
        <li className="text-black dark:text-white">{name}</li>
      </ol>
      <ToastContainer />
      {/* Header and Create Button */}
      <div className="flex justify-end items-center">
        <NavButton to="/my_dashboard/nested/form" state={{ id }}>
          <AddIcon />  Create NestedMy Dashboard Card
        </NavButton>
      </div>
      <h2 className="text-2xl font-bold font-cinzel mt-16 text-center my-5 ">{name}</h2>

      {/* Card Section */}
      {loading ? (
        <Typography>Loading cards...</Typography>
      ) : cards.length === 0 ? (
        <Typography>No dashboard cards found.</Typography>
      ) : (
        <div className="flex gap-4 flex-wrap justify-center pb-12">
          {cards.map((card) => (
            <NestedDashboardCard
              key={card._id}
              cardId={card._id}
              link={card.link}
              name={card.name}
              img={card.img}
              id={id}
              onDelete={() => deleteHandler(card._id)} // ✅ Function passed correctly
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default NestedDisplay;


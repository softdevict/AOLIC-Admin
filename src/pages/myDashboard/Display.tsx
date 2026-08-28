import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Typography } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';

import { my_dashboard_api } from '../../api/config';
import MyDashboardCard from '../../components/cards/MyDashboardCard';
import NavButton from '../../components/button/NavButton';
import AddIcon from '@mui/icons-material/Add';

interface CardData {
  name: string;
  img: string;
  _id: string;
}

function MyDashboardDisplay() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<CardData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const notifySuccess = (msg: string) => toast.success(msg);
  const notifyError = (msg: string) => toast.error(msg);

  // Fetch all cards
  const fetchCards = async () => {
    try {
      const response = await axios.get(my_dashboard_api);
      setCards(response.data.data); // Assuming response contains { data: [...] }
    } catch (error) {
      console.error('Error fetching dashboard cards:', error);
      notifyError('Failed to load dashboard cards.');
    } finally {
      setLoading(false);
    }
  };

  // Delete a card by ID
  const handleDelete = async (id: string) => {
    console.log("🚀 ~ handleDelete ~ id:", id)
    const confirmDelete = window.confirm('Are you sure you want to delete this card?');
    if (!confirmDelete) return;

    try {
      setLoading(true);
      await axios.delete(`${my_dashboard_api}/${id}`);
      notifySuccess('Card deleted successfully!');
      setCards((prevCards) => prevCards.filter((card) => card._id !== id));
    } catch (error: any) {
      console.error('Error deleting card:', error);
      const errorMsg =
        error?.response?.data?.message || 'Something went wrong while deleting.';
      notifyError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  return (
    <div className="p-4 space-y-6">
      {/* Breadcrumb */}
      <ol className="flex text-gray-500 font-semibold dark:text-white-dark space-x-2">
        <li>
          <Link to="/" className="hover:text-gray-500/70 dark:hover:text-white-dark/70">
            Home
          </Link>
        </li>
        <li>/</li>
        <li className="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70">
          My Dashboard
        </li>
      </ol>
      <ToastContainer />

      {/* Create button */}
      <div className="flex justify-end">
        <NavButton to="/my_dashboard/form">
          <AddIcon /> Create My Dashboard Card
        </NavButton>
      </div>

      {/* Cards */}
      {loading ? (
        <Typography>Loading cards...</Typography>
      ) : cards.length === 0 ? (
        <Typography>No dashboard cards found.</Typography>
      ) : (
        <div className="flex gap-4 flex-wrap justify-center pb-12">
          {cards.map((card) => (
            <MyDashboardCard
              key={card._id}
              id={card._id}
              name={card.name}
              img={card.img}
              // Pass dashboard ID in URL for editing
              toEdit={`/my_dashboard/edit/${card._id}`}
              onDelete={() => handleDelete(card._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MyDashboardDisplay;

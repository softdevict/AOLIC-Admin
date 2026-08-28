import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { display_GeofencingPopUp, display_PopUp, GeofencingPopUp } from '../../api/config';
import { Link, useNavigate } from 'react-router-dom';
import ToggleSwitch from '../../components/toggle/ToggleSwitch';
import NavButton from '../../components/button/NavButton';
import AddIcon from '@mui/icons-material/Add';

interface PopupData {
  img: string;
  displayTime1?: string;  // Made optional
  displayTime2?: string;  // Made optional
  liveTime?: string;      // Made optional
}

const Popup: React.FC = () => {
  const [popupData, setPopupData] = useState<PopupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(display_PopUp)
      .then((res) => {
        setPopupData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading popup:", err);
        setError("Failed to load popup data");
        setLoading(false);
      });
  }, []);

  const formatTimeToAMPM = (time24?: string) => {
    if (!time24) return 'Not specified';

    try {
      const [hour, minute] = time24.split(':').map(Number);
      const period = hour >= 12 ? 'PM' : 'AM';
      const adjustedHour = hour % 12 === 0 ? 12 : hour % 12;
      return `${adjustedHour}:${minute.toString().padStart(2, '0')} ${period}`;
    } catch (e) {
      console.error("Error formatting time:", e);
      return time24; // Return original if formatting fails
    }
  };

  if (loading) {
    return <div className="p-4">Loading popup data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }
  const adminType = localStorage.getItem("adminType");
  return (
    <div className="p-4">
      {/* Breadcrumb & Toggle */}
      <div className="flex justify-between items-center mb-6">
        {adminType === "super admin" && (
          <ol className="flex space-x-2 text-gray-500 font-semibold dark:text-white-dark">
            <li>
              <Link to="/" className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Home</Link>
            </li>
            <li>/</li>
            <li className="text-black dark:text-white-light">Popup</li>
          </ol>
        )}
      </div>

      {/* Create Button */}
      <div className="flex justify-between mb-4 gap-4">
        <h2 className="text-xl font-semibold mb-4">Popup Image</h2>
        <div className='flex gap-4 flex-col-reverse justify-end items-end'>
          {adminType === "super admin" && (
            <NavButton to='/popup/form'>
              <AddIcon />
              Create <span className='ml-1 md:block hidden'>Popup </span>
            </NavButton>
          )}
          <ToggleSwitch
            fetchUrl={display_GeofencingPopUp}
            apiUrl={GeofencingPopUp}
          />
        </div>
      </div>

      {/* Popup Preview */}
      <div className="text-center">
        {popupData?.img ? (
          <>
            <img
              src={popupData.img}
              alt="Popup"
              className="w-full max-w-md mx-auto rounded shadow"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder-image.png';
              }}
            />
            <div className="mt-4 text-gray-700 dark:text-white">
              <p><strong>Display Time 1:</strong> {formatTimeToAMPM(popupData.displayTime1)}</p>
              <p><strong>Display Time 2:</strong> {formatTimeToAMPM(popupData.displayTime2)}</p>
            </div>
          </>
        ) : (
          <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg max-w-md mx-auto">
            <p className="text-gray-500 dark:text-gray-400">No popup image available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Popup;

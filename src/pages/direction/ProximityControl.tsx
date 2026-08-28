import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Proximity_Control_walk_tour,
  Proximity_Control_vehicle_tour,
  Proximity_Control_video_tour,
  Proximity_Control_update_walk_tour,
  Proximity_Control_update_vehicle_tour,
  Proximity_Control_update_video_tour,
} from '../../api/config';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';

const ProximityControl = () => {
  const [walkTour, setWalkTour] = useState('');
  const [vehicleTour, setVehicleTour] = useState('');
  const [videoTour, setVideoTour] = useState('');

  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const walkRes = await axios.get(Proximity_Control_walk_tour);
      console.log("🚀 ~ fetchData ~ walkRes:", walkRes)
      setWalkTour(walkRes.data?.distance || '');

      const vehicleRes = await axios.get(Proximity_Control_vehicle_tour);
      console.log("🚀 ~ fetchData ~ vehicleRes:", vehicleRes)
      setVehicleTour(vehicleRes.data?.distance || '');

      const videoRes = await axios.get(Proximity_Control_video_tour);
      console.log("🚀 ~ fetchData ~ videoRes:", videoRes)
      setVideoTour(videoRes.data?.distance || '');
    } catch (err) {
      console.error("Error fetching proximity data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (type: 'walk' | 'vehicle' | 'video') => {
    try {
      let url = '';
      let data = {};

      if (type === 'walk') {
        url = Proximity_Control_update_walk_tour;
        data = { distance: walkTour };
      } else if (type === 'vehicle') {
        url = Proximity_Control_update_vehicle_tour;
        data = { distance: vehicleTour };
      } else if (type === 'video') {
        url = Proximity_Control_update_video_tour;
        data = { distance: videoTour };
      }

      await axios.patch(url, data);
      // alert(`Updated ${type} tour distance successfully!`);
      toast.success(`Updated ${type} tour distance successfully!`);
    } catch (err) {
      console.error(`Failed to update ${type} tour distance:`, err);
      // alert('Error updating distance');
      toast.error('Error updating distance');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const adminType = localStorage.getItem("adminType");
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex justify-between items-center mb-6">
        {adminType === "super admin" && (
          <ol className="flex text-gray-500 font-semibold dark:text-white-dark space-x-2">
            <li>
              <Link to="/">
                <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Home</button>
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link to="/direction">
                <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Maps and Tours</button>
              </Link>
            </li>
            <li>/</li>
            <li>
              <button className="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70">
                Proximity Control
              </button>
            </li>
          </ol>
        )}
      </div>
      <div className="p-6 max-w-xl mx-auto shadow-lg rounded-lg bg-white">
        <h1 className="text-2xl font-semibold text-center mb-6">Proximity Control</h1>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <div className="space-y-6">
            {/* Walk Tour */}
            <div className="space-y-2">
              <label className="block font-medium">Walk Tour Distance (in meters):</label>
              <input
                type="number"
                value={walkTour}
                onChange={(e) => setWalkTour(e.target.value)}
                className="w-full border p-2 rounded"
              />
              <button
                onClick={() => handleUpdate('walk')}
                className="px-4 py-2 text-white rounded transition-all duration-200
             bg-gradient-to-r from-[#27ae60] to-[#27ae93] hover:brightness-110 shadow-md w-[10rem]"
              >
                Update Walk Tour
              </button>

            </div>

      
          </div>
        )}
      </div>
    </>
  );
};

export default ProximityControl;

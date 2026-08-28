import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface Direction {
    _id: string;
    directionName: string;
    directionImg: string;
    directionDescription: string;
    latitude: number;
    longitude: number;
}

function DirectionDetails(): JSX.Element {
    const location = useLocation();
    const direction = location.state as Direction;

    if (!direction) {
        return <p className="text-center text-red-500 mt-10">Direction details not found</p>;
    }

    const openInGoogleMaps = () => {
        const googleMapsUrl = `https://www.google.com/maps?q=${direction.latitude},${direction.longitude}`;
        window.open(googleMapsUrl, '_blank');
    };

    return (
        <div className="max-w-3xl mx-auto p-6 shadow-lg rounded-xl mt-10 bg-white">
            <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">{direction.directionName}</h2>
            <img src={direction.directionImg} alt={direction.directionName} className="w-full h-80 object-cover rounded-lg shadow-sm mb-6" />
            <p className="text-gray-700 text-lg mb-4">{direction.directionDescription}</p>
            <div className="text-md text-gray-600 mb-4">
                <p>
                    <strong>Latitude:</strong> {direction.latitude}
                </p>
                <p>
                    <strong>Longitude:</strong> {direction.longitude}
                </p>
            </div>
            <div className="text-center">
                <button onClick={openInGoogleMaps} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200">
                    View on Map
                </button>
            </div>
        </div>
    );
}

export default DirectionDetails;

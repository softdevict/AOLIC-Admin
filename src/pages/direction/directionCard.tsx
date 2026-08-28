import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';

interface DirectionCardProps {
    directionName: string;
    directionImg: string;
    directionDescription: string;
    longitude: number;
    latitude: number;
    id: string;
}

// Utility to trim description to max words
const trimDescription = (description: string, maxWords: number = 10): string => {
    const trimmed = description.trim();
    const words = trimmed.split(/\s+/);
    return words.length > maxWords ? words.slice(0, maxWords).join(' ') + '...' : trimmed;
};

// Utility to truncate heading if too long
const truncateHeading = (text: string, maxChars: number = 10): string => {
    return text.length > maxChars ? text.slice(0, maxChars) + '...' : text;
};

const DirectionCard: React.FC<DirectionCardProps> = ({ directionName, directionImg, directionDescription, longitude, latitude, id }) => {
    const displayDescription = useMemo(() => trimDescription(directionDescription), [directionDescription]);
    const displayHeading = useMemo(() => truncateHeading(directionName), [directionName]);

    return (
        <div
            className="relative flex flex-col w-full max-w-[15rem] min-w-[6rem] p-6 bg-white rounded-md shadow-lg
                       hover:shadow-2xl hover:scale-105 transition-all duration-500 ease-in-out
                       text-[#5A382D] hover:text-[#7B480F] cursor-pointer"
            role="article"
            aria-labelledby={`direction-${id}`}
        >
            {/* Image */}
            <img
                src={directionImg || '/fallback-image.jpg'}
                alt={directionName}
                className="w-24 h-24 mx-auto rounded-full object-cover"
                onError={(e) => (e.currentTarget.src = '/fallback-image.jpg')}
            />

            {/* Heading */}
            <h3 id={`direction-${id}`} className="text-center text-xl mt-4 font-poppins" title={directionName}>
                {displayHeading}
            </h3>

            {/* Description */}
            {/* <p className="text-sm text-gray-600 text-center mt-2 font-poppins">{displayDescription}</p> */}

            {/* Coordinates */}
            <div className="mt-2 text-xs text-gray-500 text-center font-poppins">
                <p>Lat: {latitude.toFixed(4)}</p>
                <p>Lon: {longitude.toFixed(4)}</p>
            </div>

            {/* Edit Button */}
            <Link
                to="/directionmodefication"
                state={{
                    directionName,
                    directionImg,
                    directionDescription,
                    longitude,
                    latitude,
                    id,
                }}
                className="absolute right-2 top-2 p-2 bg-[#f4a460] hover:bg-[#e97451] rounded-full
                           transition-colors font-poppins focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f4a460]"
                aria-label={`Edit direction ${directionName}`}
            >
                <EditIcon sx={{ color: '#fff' }} />
            </Link>
        </div>
    );
};

export default DirectionCard;

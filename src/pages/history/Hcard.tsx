import React from 'react';
import { useNavigate } from 'react-router-dom';

interface CardProps {
    name: string;
    link: string;
}

const Hcard: React.FC<CardProps> = ({ name, link }) => {
    const navigate = useNavigate();

    return (
        <div
            className="bg-white shadow-xl p-6 rounded-xl flex flex-col items-center justify-center cursor-pointer
                       transition-transform hover:scale-105 hover:shadow-2xl text-center"
            style={{
                borderRadius: '4px',
                boxShadow: 'rgba(97, 75, 66, 0.7) 2px 2px 5px 0px',
            }}
            onClick={() => navigate(link)}
        >
            <div className="text-3xl font-bold text-[#7B480F] mb-2">{name}</div>
            <p className="text-gray-500">View all {name} history</p>
        </div>
    );
};

export default Hcard;

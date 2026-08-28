import { Link } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useEffect, useRef, useState } from 'react';

interface CardProps {
    link?: string;
    name: string;
    id: string;
    cardId: string;
    img: string;
    onDelete?: (id: string) => void;
}

const NestedDashboardCard: React.FC<CardProps> = ({ link, name, img, id, cardId, onDelete }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div
            className="relative flex flex-col items-center md:p-1 lg:p-2 m-0 p-0 w-[15rem] h-[14rem] 
                 font-poppins text-[#5A382D] md:font-bold rounded-lg shadow-2xl 
                 hover:text-[#d48e3f] transition-all duration-500 ease-in-out"
            style={{ boxShadow: 'rgba(97, 75, 66, 0.7) 2px 2px 5px 0px' }}
        >
            {/* 3-dot menu */}
            <div className="absolute md:top-2 md:right-2 top-0 right-0 z-20 hover:bg-gray-200 rounded-full" ref={menuRef}>
                <button onClick={() => setMenuOpen((prev) => !prev)} className="p-1 text-gray-800 rounded-full">
                    <MoreVertIcon fontSize="small" />
                </button>

                {menuOpen && (
                    <div className="absolute right-0 mt-2 bg-white border shadow-lg rounded-md w-24 z-30">
                        <Link
                            to={`/my_dashboard/nested/edit/${cardId}`} // Pass id in the URL parameter
                            state={{ id, link, name, img, cardId }}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-sm text-black"
                        >
                            <EditIcon fontSize="small" />
                            Edit
                        </Link>
                        <button
                            onClick={() => {
                                setMenuOpen(false);
                                onDelete?.(id);
                            }}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-sm w-full text-left text-black"
                        >
                            <DeleteIcon fontSize="small" />
                            Delete
                        </button>
                    </div>
                )}
            </div>

            <a href={link} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center">
                <img
                    src={img}
                    alt={name}
                    className="h-[7rem] w-[7rem] rounded-full object-cover mt-4 md:mt-3 lg:mt-4"
                />

                <div className="mt-4 px-5 md:h-[4rem] lg:h-[5rem] md:px-3 lg:px-4 text-center text-xl flex items-center justify-center p-0 m-0">
                    {name}
                </div>
            </a>
        </div>
    );
};

export default NestedDashboardCard;

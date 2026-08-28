

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, MenuItem, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface CardProps {
    link?: string;
    name: string;
    id: string;
    img: string;
    onDelete?: (id: string) => void;
}

const AolLoginCard: React.FC<CardProps> = ({ link, name, img, id, onDelete }) => {
    
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const truncateText = (text: string, maxChars: number) => {
        if (text.length > maxChars) {
            return text.slice(0, maxChars - 3) + '...';
        }
        return text;
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEdit = () => {
        navigate('/aol-logins/add-edit', { state: { link, name, img, id } });
        handleMenuClose();
    };

    const handleDelete = () => {
        if (onDelete) onDelete(id);
        handleMenuClose();
    };

    return (
        <div
            className="shadow-2xl flex p-10 transition-all duration-500 ease-in-out
                       text-[#5A382D] hover:text-[#d48e3f] font-bold 
                       hover:shadow-2xl hover:scale-105 hover:px-9
                       w-full flex-col cursor-pointer min-w-6 relative font-poppins"
            style={{
                backgroundColor: 'white',
                boxShadow: 'rgba(97, 75, 66, 0.7) 2px 2px 5px 0px',
                borderRadius: '4px',
                maxWidth: '15rem',
                maxHeight: '14rem',
            }}
        >
            {/* Menu Button */}
            <div className="absolute top-2 right-2">
                <IconButton onClick={handleMenuOpen} size="small">
                    <MoreVertIcon />
                </IconButton>
            </div>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={handleEdit}>
                    <EditIcon fontSize="small" className="mr-2" /> Edit
                </MenuItem>
                <MenuItem onClick={handleDelete}>
                    <DeleteIcon fontSize="small" className="mr-2" /> Delete
                </MenuItem>
            </Menu>

            {/* Image */}
            <img
                src={img}
                alt={name}
                style={{
                    height: '5rem',
                    width: '5rem',
                    margin: 'auto',
                    borderRadius: '5rem',
                }}
            />

            {/* Name/Link */}
            {link ? (
                <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-center m-auto text-xl h-20 mt-4 flex justify-center items-center font-poppins"
                >
                    {truncateText(name, 20)}
                </a>
            ) : (
                <p className="text-center m-auto text-xl h-20 mt-4 flex justify-center items-center font-poppins">
                    {truncateText(name, 20)}
                </p>
            )}
        </div>
    );
};

export default AolLoginCard;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Menu, MenuItem, IconButton } from '@mui/material';

interface CardProps {
  link?: string;
  name: string;
  id: string;
  img: string;
  editUrl?: string;
  onDelete?: (id: string) => void;
}

const Card: React.FC<CardProps> = ({ link, name, id, img, editUrl = '/HomeCard/edit', onDelete }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    navigate(editUrl, { state: { id, link, name, img } });
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete?.(id);
    handleMenuClose();
  };

  const truncateText = (text: string, maxChars: number) =>
    text.length > maxChars ? `${text.slice(0, maxChars - 3)}...` : text;

  return (
    <div
      className="relative flex flex-col items-center md:p-1 lg:p-2 m-0 p-0 w-[15rem] h-[14rem] 
                 font-poppins text-[#5A382D] md:font-bold rounded-lg shadow-2xl 
                 hover:text-[#d48e3f] transition-all duration-500 ease-in-out "
      style={{ boxShadow: 'rgba(97, 75, 66, 0.7) 2px 2px 5px 0px' }}
    >
      {/* Options Menu Button */}
      <div className="absolute top-0 right-0 md:top-1 md:right-1 z-10">
        <IconButton onClick={handleMenuOpen}>
          <MoreVertIcon />
        </IconButton>
      </div>

      {/* Dropdown Menu */}
      <Menu
        id="card-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleEdit}>
          <EditIcon fontSize="small" className=" mr-2" /> Edit
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <DeleteIcon fontSize="small" className=" mr-2" /> Delete
        </MenuItem>
      </Menu>

      {/* Content Section */}
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center "
        >
          <img
            src={img}
            alt={name}
            className=" h-[7rem] w-[7rem] rounded-full object-cover mt-4 md:mt-3 lg:mt-4"
          />
          <div className="mt-4 px-5 md:h-[4rem] lg:h-[5rem] md:px-3 lg:px-4 text-center text-xl flex items-center justify-center  p-0 m-0">
            {/* {truncateText(name, 20)} */}
            {name}
          </div>
        </a>
      ) : (
        <div className="flex flex-col items-center justify-center mt-4">
          <img
            src={img}
            alt={name}
            className="mt-4 h-[7rem] w-[7rem] rounded-full object-cover md:mt-3 lg:mt-4"
          />
          <div className=" mt-4 px-5 md:h-[4rem] lg:h-[5rem] md:px-3 lg:px-4 text-center text-xl flex items-center justify-center  p-0 m-0">
            {/* {truncateText(name, 20)} */}
            {name}
          </div>
        </div>
      )}
    </div>
  );
};

export default Card;

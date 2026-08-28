import { Link } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from 'react';

interface MyDashboardCardProps {
  name: string;
  id: string;
  img: string;
  toView?: string; // Optional route for viewing
  toEdit?: string; // Optional route for editing
  onDelete?: (id: string) => void; // Optional delete handler
}

const MyDashboardCard: React.FC<MyDashboardCardProps> = ({
  name,
  id,
  img,
  toView = '/my_dashboard/nested',
  toEdit = '/my_dashboard/edit',
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const truncateText = (text: string, maxChars: number) =>
    text.length > maxChars ? `${text.slice(0, maxChars - 3)}...` : text;

  return (
   
    <div
      className="relative flex flex-col items-center md:p-1 lg:p-2 m-0 p-0 w-[15rem] h-[14rem] 
                 font-poppins text-[#5A382D] md:font-bold rounded-lg shadow-2xl 
                 hover:text-[#d48e3f] transition-all duration-500 ease-in-out "
      style={{ boxShadow: 'rgba(97, 75, 66, 0.7) 2px 2px 5px 0px' }}
    >
      <Link to={toView}
        state={{ id, name }}
        className=''
      >
        {/* Image */}
        <img
          src={img}
          alt={name}
          // className="h-[5rem] w-[5rem] rounded-full object-cover mb-4"
          className="mt-4 h-[7rem] w-[7rem] rounded-full object-cover md:mt-3 lg:mt-4 m-auto"
        />

        {/* Name with link */}
        <p

          className="mt-4 px-5 md:h-[4rem] lg:h-[5rem] md:px-3 lg:px-4 text-center text-xl flex items-center justify-center  p-0 m-0"
        >
          {/* {truncateText(name, 20)} */}
          {name}
        </p>
      </Link>

      {/* 3-dot menu */}
      <div className="absolute top-0 right-0 md:top-2 md:right-2">
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="p-1 rounded-full text-gray-800 hover:bg-gray-200"
        >
          <MoreVertIcon />
        </button>

        {/* Dropdown menu */}
        {menuOpen && (
          <div className="absolute right-0 ms:mt2 mt-0 w-[120px] bg-white border rounded shadow-md z-10">
            <Link
              to={toEdit}
              state={{ id, name, img }}
              className="flex items-center px-3 py-2 text-sm "
              style={{
                color: "black"
              }}
            >
              <EditIcon sx={{ fontSize: 18, marginRight: '6px' }} />
              Edit
            </Link>
            <button
              onClick={() => {
                if (onDelete) onDelete(id);
                setMenuOpen(false);
              }}
              className="flex items-center w-full px-3 py-2 text-sm  text-left text-black "
            >
              <DeleteIcon sx={{ fontSize: 18, marginRight: '6px' }} />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDashboardCard;

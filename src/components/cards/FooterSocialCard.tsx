import React from 'react';
import { Link } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';

interface CardProps {
  link?: string;
  action: string;
  id: string;
  img?: string;
}

const FooterSocialCard: React.FC<CardProps> = ({ link, action, id, img }) => {
  const defaultImage = "https://via.placeholder.com/100?text=No+Image";

  return (
    <div
      key={id}
      className="relative flex flex-col items-center p-0 m-0 md:p-1 lg:p-2 
                 w-[15rem] h-[14rem] 
                  font-poppins text-[#5A382D] md:font-bold 
                 rounded-lg shadow-2xl hover:text-[#d48e3f] 
                 transition-all duration-500 ease-in-out cursor-pointer"
      style={{ boxShadow: 'rgba(97, 75, 66, 0.7) 2px 2px 5px 0px' }}
    >
      {/* Link opens in a new tab only if link is provided */}
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center"
        >
          <img
            src={img || defaultImage}
            alt={action}
            className="mt-4 h-[7rem] w-[7rem] rounded-full object-cover md:mt-3 lg:mt-4"
          />
          <div className="mt-4 px-1 md:h-[4rem]  md:px-3 lg:px-4 text-center text-xl flex items-center justify-center  p-0 m-0">
            {action}
          </div>
        </a>
      ) : (
        <div className="flex flex-col items-center">
          <img
            src={img || defaultImage}
            alt={action}
            className="mt-4 h-[7rem] w-[7rem] rounded-full object-cover md:mt-3 lg:mt-4"
          />
          <div className="mt-4 px-1 md:h-[4rem]  md:px-3 lg:px-4 text-center text-xl flex items-center justify-center  p-0 m-0">
            {action}
          </div>
        </div>
      )}

      {/* Edit button */}
      <Link
        to="/footer_social_edit_card"
        state={{ link, action, img, id }}
        className="bg-[#ff72271e] md:bg-[#fad2ae] absolute right-2 top-2 rounded-full p-2 transition-all"
      >
        {/* <EditIcon sx={{ color: '#e97451' }} /> */}
        <EditIcon sx={{ color: '#e97451' }} fontSize="small" />

      </Link>
    </div>
  );
};

export default FooterSocialCard;

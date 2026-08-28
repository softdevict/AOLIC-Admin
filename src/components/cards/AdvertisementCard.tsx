import React from "react";

interface CardProps {
  link: string;
  img: string;
  id: string;
  index?: number;
  name: string;
  onClick?: () => void;
}

const AdvertisementCard: React.FC<CardProps> = ({
  link,
  img,
  id,
  index = 1,
  name,
  onClick,
}) => {
  const defaultImage = "https://via.placeholder.com/100?text=No+Image";
  const handleClick = () => {
   
    if (link) {
    window.open(link, '_blank'); // opens in a new tab
  }
  };
  return (

   
    <div
      onClick={handleClick}
      className="relative flex flex-col items-center md:p-1 lg:p-2 m-0 p-0 w-[18rem] min-h-[14rem] 
                 font-poppins text-[#5A382D] md:font-bold rounded-lg shadow-2xl 
                 hover:text-[#d48e3f] transition-all duration-500 ease-in-out "
      style={{ boxShadow: 'rgba(97, 75, 66, 0.7) 2px 2px 5px 0px' }}
    >
     
      <img
        src={img && !img.includes("undefined") ? img : defaultImage}
        alt={`Advertisement ${index}`}
     
        className="h-[80%] w-[100%]  rounded-sm object-cover mt-2 md:mt-3 lg:mt-4"
      />
     <div className="px-1 md:h-[4rem] lg:h-[5rem] md:px-3 lg:px-4 text-center mt-3 text-xl flex items-center justify-center  p-0 m-0">

       {/* {(name?.length > 20 ? name.slice(0, 20) + "..." : name) || "Untitled"} */}
       {name}
        </div>

  
    </div>
  );
};

export default AdvertisementCard;

import React from "react";
import { useNavigate } from "react-router-dom";

interface AdvertisementBarProps {
  link?: string;
}

const TypeCard: React.FC<AdvertisementBarProps> = ({  }) => {
    const navigate = useNavigate()
  return (
<div 
style={{display : "flex",
    // justifyContent: "space-around",
    alignItems: "center"
}}
>
<a
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white rounded-lg shadow-2xl h-40 flex flex-col p-10 
                 transition-all duration-500 ease-in-out 
                 hover:text-blue-900 hover:font-bold hover:shadow-2xl hover:scale-105 
                 w-full md:w-1/3"
                 onClick={()=>navigate("/action")}
    >
      <div className="text-center m-auto">
     Teacher
      </div>
      </a>
</div>
   
  );
};

export default TypeCard;

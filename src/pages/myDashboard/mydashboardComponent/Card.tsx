import React, { useState, useEffect, useRef } from "react";
import { MoreVertical, Image, Edit3, Trash2, ExternalLink, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MyDashboardCardProps {
    img: string;
    name: string;
    onEdit: () => void;
    onDelete: () => void;
    navigateTo?: string | { pathname: string; state?: any };
    disabled?: boolean;
    badge?: string; // New optional badge prop
}

const MyDashboardCard: React.FC<MyDashboardCardProps> = ({
    img,
    name,
    onEdit,
    onDelete,
    navigateTo,
    disabled = false,
    badge
}) => {
    const [showMenu, setShowMenu] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleCardClick = () => {
        if (!navigateTo) return;

        if (typeof navigateTo === "string") {
            navigate(navigateTo);
        } else {
            navigate(navigateTo.pathname, { state: navigateTo.state });
        }
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    const handleImageError = () => {
        setImageError(true);
        setImageLoaded(true);
    };

    return (
        <div
            ref={menuRef}
            className="relative w-72 h-80 rounded-2xl shadow-lg overflow-hidden cursor-pointer group transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
            onClick={handleCardClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Shimmer effect on hover */}
            {isHovered && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer z-10 pointer-events-none"></div>
            )}

            {/* Background image with loading state */}
            {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse z-0">
                    <Image size={40} className="text-gray-400 opacity-50" />
                </div>
            )}

            {imageError ? (
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                    <Image size={40} className="text-gray-400" />
                </div>
            ) : (
                <img
                    src={img}
                    alt={name}
                    className={`w-full h-full object-cover transition-all duration-700 ${imageLoaded ? "opacity-100" : "opacity-0"
                        } ${isHovered ? "scale-110" : "scale-100"}`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                />
            )}

            {/* Gradient overlay with animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-95"></div>

            {/* Optional badge */}
            {badge && (
                <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md z-10">
                    {badge}
                </div>
            )}

            {/* View indicator with animation */}
            {isHovered && navigateTo && (
                <div className="absolute top-3 right-12 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl flex items-center z-10 transition-all duration-300 animate-in slide-in-from-right-6">
                    <ExternalLink size={14} className="text-gray-700 mr-2" />
                    <span className="text-xs font-medium text-gray-700">View</span>
                </div>
            )}

            {/* Text container with improved typography */}
            <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                <h3 className="text-white text-xl font-bold drop-shadow-lg truncate mb-2">{name}</h3>
                <div className="h-1 w-10 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mt-2 transition-all duration-500 group-hover:w-16 group-hover:opacity-100"></div>
            </div>

            {/* 3-dot menu with improved styling */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu((prev) => !prev);
                }}
                className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-300 z-20 ${disabled
                    ? "bg-gray-400/30 cursor-not-allowed"
                    : "bg-white/20 hover:bg-white/30 hover:scale-110"
                    }`}
                disabled={disabled}
            >
                <MoreVertical size={18} className={disabled ? "text-gray-400" : "text-white"} />
            </button>

            {/* Enhanced dropdown menu */}
            {showMenu && (
                <div className="absolute top-12 right-3 bg-white border border-gray-100 rounded-xl shadow-2xl z-30 w-48 overflow-hidden animate-in fade-in-80 slide-in-from-top-5">
                    <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500 flex items-center">
                        <Sparkles size={12} className="mr-1" />
                        Actions
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(false);
                            onEdit();
                        }}
                        className="flex items-center px-4 py-3 text-sm font-medium hover:bg-blue-50 w-full text-left text-blue-600 transition-all duration-200 focus:outline-none"
                    >
                        <Edit3 size={16} className="mr-3" />
                        Edit
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(false);
                            onDelete();
                        }}
                        className={`flex items-center px-4 py-3 text-sm font-medium w-full text-left transition-all duration-200 ${disabled
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-red-600 hover:bg-red-50 focus:bg-red-50"
                            }`}
                        disabled={disabled}
                    >
                        <Trash2 size={16} className="mr-3" />
                        Delete
                    </button>
                </div>
            )}

            {/* Subtle hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 opacity-0 transition-all duration-500 group-hover:opacity-100"></div>
        </div>
    );
};

export default MyDashboardCard;
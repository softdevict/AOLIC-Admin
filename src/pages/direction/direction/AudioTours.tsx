// DisplayAudioTours.tsx
import axios, { type AxiosError } from "axios";
import type React from "react";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
    delete_audioTour,
    get_audioTour,
    GeofencingTOUR,
    display_GeofencingTOUR,
} from "../../../api/config";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Link, useNavigate } from "react-router-dom";
import IconPencilPaper from "../../../components/Icon/IconPencilPaper";
import IconTrash from "../../../components/Icon/IconTrash";
import ToggleSwitch from "../../../components/toggle/ToggleSwitch";
import NavButton from "../../../components/button/NavButton";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddIcon from '@mui/icons-material/Add';

// API endpoints for static audio (not used here, but kept for consistency if needed)
const static_audioTour = ""; // Placeholder if needed

// Type definitions
interface AudioTour {
    _id: string;
    language: string;
    audioDirectionName: string;
    audioDirectionImg: string;
    audioTourModel: string;
    audioLink: string;
    videoLink?: string;
    latitude: number;
    longitude: number;
    audioDirectionText: string;
    directionUserModel: string;
    isPaid: boolean;
    price?: number;
}

interface ApiResponse<T> {
    data: T[];
    success?: boolean;
    message?: string;
}

interface ErrorResponse {
    message?: string;
}

// Loading spinner component
const LoadingSpinner: React.FC = () => (
    <svg className="animate-spin h-5 w-5 text-red-600" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
);

// Media player component
interface MediaPlayerProps {
    item: AudioTour;
    purchasedItems: string[];
    onPayment: (itemId: string, price?: number) => void;
}

const MediaPlayer: React.FC<MediaPlayerProps> = ({ item, purchasedItems, onPayment }) => {
    const isPaid = item.isPaid;
    const isUnlocked = !isPaid || purchasedItems.includes(item._id);

    if (isPaid && !isUnlocked) {
        return (
            <button
                onClick={() => onPayment(item._id, item.price)}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                aria-label={`Pay to access ${item.audioDirectionName}`}
            >
                Pay to Access
            </button>
        );
    }

    if (item.audioLink) {
        return (
            <audio controls className="w-full max-w-xs" aria-label={`Audio for ${item.audioDirectionName}`}>
                <source src={item.audioLink} type="audio/mpeg" />
                Your browser does not support the audio tag.
            </audio>
        );
    }

    if (item.videoLink) {
        return (
            <Link
                to={item.videoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-950 bg-transparent hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors duration-300 ease-in-out shadow-sm"
            >
                View Video
            </Link>
        );
    }

    return <span className="text-gray-500">No media available</span>;
};

// Skeleton loading component
interface SkeletonRowsProps {
    count: number;
}

const SkeletonRows: React.FC<SkeletonRowsProps> = ({ count }) => (
    <tbody>
        {[...Array(count)].map((_, idx) => (
            <tr key={idx} className="border-t border-gray-200">
                <td className="py-3 px-6">
                    <Skeleton width={50} />
                </td>
                <td className="py-3 px-6">
                    <Skeleton width={150} />
                </td>
                <td className="py-3 px-6">
                    <Skeleton circle width={48} height={48} />
                </td>
                <td className="py-3 px-6">
                    <Skeleton width={200} />
                </td>
                <td className="py-3 px-6">
                    <Skeleton width={100} />
                </td>
                <td className="py-3 px-6">
                    <Skeleton width={100} />
                </td>
                <td className="py-3 px-6">
                    <Skeleton width={100} />
                </td>
                <td className="py-3 px-6">
                    <Skeleton width={80} />
                </td>
            </tr>
        ))}
    </tbody>
);

// Main component
const DisplayAudioTours: React.FC = (): JSX.Element => {
    // State declarations
    const [audioTours, setAudioTours] = useState<AudioTour[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(5);
    const [purchasedItems, setPurchasedItems] = useState<string[]>(() => {
        try {
            return JSON.parse(localStorage.getItem("purchasedItems") || "[]");
        } catch {
            return [];
        }
    });

    const navigate = useNavigate();

    // Update localStorage when purchasedItems changes
    useEffect(() => {
        try {
            localStorage.setItem("purchasedItems", JSON.stringify(purchasedItems));
        } catch (error) {
            console.error("Error saving purchased items to localStorage:", error);
        }
    }, [purchasedItems]);

    // Fetch data function
    const fetchData = useCallback(async (): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get<ApiResponse<AudioTour> | AudioTour[]>(get_audioTour);

            const audioToursData = Array.isArray(response.data)
                ? response.data
                : (response.data as ApiResponse<AudioTour>).data || [];
            setAudioTours(audioToursData);
        } catch (error) {
            console.error("Error fetching audio tours:", error);
            setError("Failed to load data. Please try again.");
            setAudioTours([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial data fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Pagination calculations
    const { totalPages, currentItems, startIndex } = useMemo(() => {
        const total = Math.ceil(audioTours.length / itemsPerPage);
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const current = audioTours.slice(start, end);

        return {
            totalPages: total,
            currentItems: current,
            startIndex: start,
        };
    }, [audioTours, currentPage, itemsPerPage]);

    // Handle page navigation
    const handleNextPage = useCallback((): void => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
        }
    }, [currentPage, totalPages]);

    const handlePreviousPage = useCallback((): void => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    }, [currentPage]);

    // Handle delete
    const handleDelete = useCallback(
        async (id: string): Promise<void> => {
            if (!window.confirm("Are you sure you want to delete this audio tour?")) {
                return;
            }

            try {
                setDeleteLoading(id);
                await axios.delete(`${delete_audioTour}/${id}`);
                toast.success("Audio tour deleted successfully");

                setAudioTours((prev) => prev.filter((item) => item._id !== id));

                // Adjust current page if necessary
                const remainingItems = audioTours.length - 1;
                const newTotalPages = Math.ceil(remainingItems / itemsPerPage);

                if (currentPage > newTotalPages && newTotalPages > 0) {
                    setCurrentPage(newTotalPages);
                }
            } catch (error: unknown) {
                const axiosError = error as AxiosError<ErrorResponse>;
                console.error("Error deleting audio tour:", error);
                toast.error(axiosError.response?.data?.message || "Failed to delete audio tour. Please try again.");
            } finally {
                setDeleteLoading(null);
            }
        },
        [audioTours.length, currentPage, itemsPerPage],
    );

    // Handle edit
    const handleEdit = useCallback(
        (id: string): void => {
            const audioTour = audioTours.find((item) => item._id === id);
            if (audioTour) {
                navigate("/audioTourModification", { state: audioTour });
            }
        },
        [audioTours, navigate],
    );

    // Mock payment function
    const handleMockPayment = useCallback((itemId: string, price = 0): void => {
        const formattedPrice = price;
        if (window.confirm(`Mock Payment: Would you like to pay $${formattedPrice} to access this content?`)) {
            setPurchasedItems((prev) => [...prev, itemId]);
            toast.success("Payment successful! Content unlocked.");
        }
    }, []);

    // Get item properties
    const getItemProperties = useCallback(
        (item: AudioTour) => {
            return {
                name: item.audioDirectionName,
                image: item.audioDirectionImg,
                description: item.audioDirectionText,
            };
        },
        [],
    );
    const adminType = localStorage.getItem("adminType");
    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

            <div className="flex justify-between items-center mb-6">
                {adminType === "super admin" && (
                    <ol className="flex text-gray-500 font-semibold dark:text-white-dark space-x-2">
                        <li>
                            <Link to="/">
                                <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Home</button>
                            </Link>
                        </li>
                        <li>/</li>
                        <li>
                            <button className="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70">
                                Audio Tours
                            </button>
                        </li>
                    </ol>)}
                {adminType === "super admin" && (
                    <ToggleSwitch fetchUrl={display_GeofencingTOUR} apiUrl={GeofencingTOUR} />
                )}
            </div>

            <div className="min-h-screen bg-gray-50 py-12 px-0 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Audio Tours</h1>

                    {/* Action Buttons */}
                    {adminType === "super admin" && (
                        <div className="flex justify-end mb-4 gap-2 items-center">
                            <NavButton to="/direction/languageControl">Language Control</NavButton>
                            <NavButton to="/direction/proximityControl">Proximity Control</NavButton>
                            <NavButton to="/addAudioTour">
                                Add Audio Tour
                            </NavButton>
                            <NavButton to="/addAndModDefaultTour">Add instrumental audio</NavButton>
                        </div>
                    )}
                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
                            <span>{error}</span>
                            <button
                                onClick={() => setError(null)}
                                className="text-red-700 hover:text-red-900 font-bold"
                                aria-label="Dismiss error"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {/* Main Content */}
                    {loading ? (
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <table className="min-w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="py-3 px-6 text-left text-gray-800" scope="col">
                                            Serial No
                                        </th>
                                        <th className="py-3 px-6 text-left text-gray-800" scope="col">
                                            Pin Name
                                        </th>
                                        <th className="py-3 px-6 text-left text-gray-800 w-[6rem]" scope="col">
                                            Pin Image
                                        </th>
                                        <th className="py-3 px-6 text-left text-gray-800" scope="col">
                                            Pin Text
                                        </th>
                                        <th className="py-3 px-6 text-left text-gray-800" scope="col">
                                            Latitude
                                        </th>
                                        <th className="py-3 px-6 text-left text-gray-800" scope="col">
                                            Longitude
                                        </th>
                                        <th className="py-3 px-6 text-center min-w-[10rem] text-gray-800" scope="col">
                                            Media
                                        </th>
                                        <th className="py-3 px-6 text-left text-gray-800" scope="col">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <SkeletonRows count={itemsPerPage} />
                            </table>
                        </div>
                    ) : currentItems.length > 0 ? (
                        <>
                            <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
                                <table className="min-w-full table-auto" role="grid">
                                    <thead style={{ overflow: "scroll" }}>
                                        <tr className="bg-gray-100">
                                            <th className="py-3 px-6 text-left text-gray-800" scope="col">
                                                Serial No
                                            </th>
                                            <th className="py-3 px-6 text-left text-gray-800" scope="col">
                                                Pin Name
                                            </th>
                                            <th className="py-3 px-6 text-left text-gray-800 w-[6rem]" scope="col">
                                                Pin Image
                                            </th>
                                            <th className="py-3 px-6 text-left text-gray-800" scope="col">
                                                Pin Text
                                            </th>
                                            <th className="py-3 px-6 text-left text-gray-800" scope="col">
                                                Latitude
                                            </th>
                                            <th className="py-3 px-6 text-left text-gray-800" scope="col">
                                                Longitude
                                            </th>
                                            <th className="py-3 px-6 text-center min-w-[10rem] text-gray-800" scope="col">
                                                Media
                                            </th>
                                            <th className="py-3 px-6 text-left text-gray-800" scope="col">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.map((item, index) => {
                                            const { name, image, description } = getItemProperties(item);
                                            const isDeleting = deleteLoading === item._id;

                                            return (
                                                <tr key={item._id} className="border-t border-gray-200 hover:bg-gray-50">
                                                    <td className="py-3 px-6 text-gray-700">{startIndex + index + 1}</td>
                                                    <td className="py-3 px-6 text-gray-700 font-medium w-32 break-words">{name}</td>
                                                    <td className="py-3 px-6 text-gray-700">
                                                        <img
                                                            src={image}
                                                            alt={`${name} image`}
                                                            className="w-[4rem] h-[2.5rem] lg:h-[3rem] object-cover rounded-full"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.src = "/placeholder.svg?height=48&width=48";
                                                            }}
                                                        />
                                                    </td>
                                                    <td className="py-3 px-6 text-gray-700 max-w-xs break-words">{description}</td>
                                                    <td className="py-3 px-6 text-gray-700">{item.latitude}</td>
                                                    <td className="py-3 px-6 text-gray-700">{item.longitude}</td>
                                                    <td className="py-3 px-6 text-center">
                                                        <MediaPlayer
                                                            item={item}
                                                            purchasedItems={purchasedItems}
                                                            onPayment={handleMockPayment}
                                                        />
                                                    </td>
                                                    <td className="py-3 px-6">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                onClick={() => handleEdit(item._id)}
                                                                className="text-blue-400 hover:text-blue-600 transition-colors p-1 disabled:opacity-50"
                                                                title={`Edit ${name}`}
                                                                aria-label={`Edit ${name}`}
                                                                disabled={isDeleting}
                                                            >
                                                                <IconPencilPaper />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(item._id)}
                                                                className="text-red-400 hover:text-red-600 transition-colors p-1 disabled:opacity-50"
                                                                title={`Delete ${name}`}
                                                                aria-label={`Delete ${name}`}
                                                                disabled={isDeleting}
                                                            >
                                                                {isDeleting ? <LoadingSpinner /> : <IconTrash />}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex justify-between items-center mt-6">
                                    <button
                                        onClick={handlePreviousPage}
                                        disabled={currentPage === 1}
                                        className={`px-4 py-2 rounded-md transition-colors ${currentPage === 1
                                            ? "bg-gray-300 cursor-not-allowed text-gray-500"
                                            : "bg-blue-500 hover:bg-blue-600 text-white"
                                            }`}
                                        aria-label="Previous page"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-gray-700 font-medium">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={currentPage === totalPages}
                                        className={`px-4 py-2 rounded-md transition-colors ${currentPage === totalPages
                                            ? "bg-gray-300 cursor-not-allowed text-gray-500"
                                            : "bg-blue-500 hover:bg-blue-600 text-white"
                                            }`}
                                        aria-label="Next page"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-lg shadow-lg">
                            <p className="text-gray-500 text-lg mb-4">No audio tours available</p>
                            <button
                                onClick={fetchData}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                aria-label="Refresh data"
                            >
                                Refresh Data
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default DisplayAudioTours;
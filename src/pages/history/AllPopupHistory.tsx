import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { all_PopUp } from '../../api/config';
import { Link } from 'react-router-dom';

interface Popup {
    id: string;
    title: string;
    message: string;
    img?: string;
    createdAt: string;
    updatedAt: string;
}

function AllPopupHistory() {
    const [popups, setPopups] = useState<Popup[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPopups = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await axios.get(all_PopUp);

                if (Array.isArray(response.data)) {
                    setPopups(response.data);
                } else if (Array.isArray(response.data?.data)) {
                    setPopups(response.data.data);
                } else {
                    setError('Invalid data format received from server');
                }
            } catch (err) {
                console.error('Error fetching popups:', err);
                setError(axios.isAxiosError(err) ? err.response?.data?.message || err.message : 'Failed to fetch popup history');
            } finally {
                setLoading(false);
            }
        };

        fetchPopups();
    }, []);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
                              <ol className="flex text-gray-500 font-semibold dark:text-white-dark space-x-2">
              <Link to="/">
                                    <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70"
                                    
                                    >Home</button>
                                </Link>
                <li>/</li>
              <Link to="/history">
                                    <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70"
                                    
                                    >History</button>
                                </Link>
                <li>/</li>
                <li>
                    <button className="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70">Popup History
</button>
                </li>
               
            </ol>
        <div className="p-4">
            <h2 className="text-2xl font-semibold mb-4">Popup History</h2>

            {loading && (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-600">Loading popup history...</span>
                </div>
            )}

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">Error: {error}</div>}

            {!loading && !error && (
                <>
                    {popups.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white border border-gray-200 text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="py-3 px-4 border-b text-left">Image</th>
                                        {/* <th className="py-3 px-4 border-b text-left">Title</th> */}
                                        <th className="py-3 px-4 border-b text-right pr-8">Created on</th>
                                        {/* <th className="py-3 px-4 border-b text-left">Last Updated</th> */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {popups.map((popup) => (
                                        <tr key={popup.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 border-b">
                                                {popup.img ? (
                                                    <img src={popup.img} alt={popup.title || 'Popup image'} className="h-16 w-auto rounded border border-gray-200" />
                                                ) : (
                                                    <span className="text-gray-400 italic">No image</span>
                                                )}
                                            </td>
                                            {/* <td className="py-3 px-4 border-b text-gray-800">{popup.title}</td> */}
                                            <td className="py-3 px-4 border-b text-gray-600 text-right">{formatDate(popup.createdAt)}</td>
                                            {/* <td className="py-3 px-4 border-b text-gray-600">{formatDate(popup.updatedAt)}</td> */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">No popup history available.</div>
                    )}
                </>
            )}
        </div>
        </>
    );
}

export default AllPopupHistory;

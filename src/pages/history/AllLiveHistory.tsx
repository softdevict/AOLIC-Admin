import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { previous_liveLink } from '../../api/config';
import { Link } from 'react-router-dom';

interface LiveLink {
    _id: string;
    link: string;
    stoppedAt: string;
    date: string;
    time: string;
}

function AllLiveHistory() {
    const [liveLinks, setLiveLinks] = useState<LiveLink[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLiveLinks = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await axios.get(previous_liveLink);
                console.log('Live link history:', response.data);

                if (response.data && Array.isArray(response.data.data)) {
                    setLiveLinks(response.data.data);
                } else {
                    setError('Invalid data format received');
                }
            } catch (err) {
                console.error('Error fetching live links:', err);
                setError(axios.isAxiosError(err) ? err.response?.data?.message || err.message : 'Failed to fetch live link history');
            } finally {
                setLoading(false);
            }
        };

        fetchLiveLinks();
    }, []);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const handleOpen = (url: string) => {
        window.open(url, '_blank');
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
                    <button className="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70">Live Link History
</button>
                </li>
               
            </ol>
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Live Link History</h1>

            {loading && (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading live links...</span>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {!loading && !error && (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    {liveLinks.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Live Link</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Ended</th>
                                        {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th> */}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {liveLinks.map((link) => (
                                        <tr key={link._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap max-w-sm">
                                                <a href={link.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 break-words" title={link.link}>
                                                    {link.link.length > 40 ? `${link.link.slice(0, 40)}...` : link.link}
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{link.date || 'N/A'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{link.time || 'N/A'}</td>
                                            {/* <td className="px-6 py-4 text-sm font-medium">
                                                <button onClick={() => handleCopy(link.link)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                                    Copy
                                                </button>
                                                <button onClick={() => handleOpen(link.link)} className="text-green-600 hover:text-green-900">
                                                    Open
                                                </button>
                                            </td> */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No live links</h3>
                            <p className="mt-1 text-sm text-gray-500">There are no previous live links to display.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
        </>
    );
}

export default AllLiveHistory;

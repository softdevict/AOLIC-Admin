import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { all_youtube_link, delete_youtube_link } from '../../api/config';
import { Link } from 'react-router-dom';

interface YouTubeLink {
    _id: string;
    thumbnail: string;
    thumbnailName: string;
    YouTubeLink: string;
    platform: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

function PeaceOfMindHistory() {
    const [links, setLinks] = useState<YouTubeLink[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLinks();
    }, []);

    const fetchLinks = () => {
        setLoading(true);
        axios
            .get(all_youtube_link)
            .then((response) => {
                setLinks(response.data.links);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching links:', error);
                setLoading(false);
            });
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this link?')) {
            axios
                .delete(`${delete_youtube_link}/${id}`)
                .then(() => {
                    fetchLinks(); // Refresh the list after deletion
                })
                .catch((error) => {
                    console.error('Error deleting link:', error);
                });
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

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
                    <button className="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70">Peace Of Mind History
                    </button>
                </li>

            </ol>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">Peace Of Mind History</h1>

                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="py-2 px-4 border-b">Thumbnail</th>
                                <th className="py-2 px-4 border-b">Name</th>
                                <th className="py-2 px-4 border-b">YouTube Link</th>
                                <th className="py-2 px-4 border-b">Platform</th>
                                <th className="py-2 px-4 border-b">Created At</th>
                                <th className="py-2 px-4 border-b">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {links.map((link) => (
                                <tr key={link._id} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b">
                                        <img src={link.thumbnail} alt={link.thumbnailName} className="w-16 h-16 object-cover" />
                                    </td>
                                    <td className="py-2 px-4 border-b">{link.thumbnailName}</td>
                                    <td className="py-2 px-4 border-b">
                                        <a href={link.YouTubeLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                            {link.YouTubeLink}
                                        </a>
                                    </td>
                                    <td className="py-2 px-4 border-b">{link.platform}</td>
                                    <td className="py-2 px-4 border-b">{new Date(link.createdAt).toLocaleString()}</td>
                                    <td className="py-2 px-4 border-b">
                                        <button onClick={() => handleDelete(link._id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default PeaceOfMindHistory;

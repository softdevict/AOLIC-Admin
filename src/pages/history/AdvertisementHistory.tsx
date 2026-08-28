import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { display_all_history_advertise } from '../../api/config';
import { Link } from 'react-router-dom';

interface Advert {
    img1: { link: string; img: string };
    img2: { link: string; img: string };
    img3: { link: string; img: string };
}

interface HistoryItem {
    _id: string;
    archivedAt: string;
    archivedAds: Advert[];
}

const AdvertisementHistory: React.FC = () => {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    useEffect(() => {
        axios
            .get(display_all_history_advertise)
            .then((res) => {
                setHistory(res.data.historyOfAdvertisement);
            })
            .catch((err) => {
                console.error('Error fetching ad history:', err);
            });
    }, []);

    return (
        <>
        <div className="p-6">                      <ol className="flex text-gray-500 font-semibold dark:text-white-dark space-x-2">
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
                    <button className="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70">Advertisement History
</button>
                </li>
               
            </ol>
            <h2 className="text-2xl font-semibold mb-4">Advertisement History</h2>
            {history.length === 0 ? (
                <p>No history available.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full border text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 border">#</th>
                                <th className="p-2 border">Image 1</th>
                                <th className="p-2 border">Image 2</th>
                                <th className="p-2 border">Image 3</th>
                                <th className="p-2 border">Archived At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((item, index) =>
                                item.archivedAds.map((ad, adIndex) => (
                                    <tr key={`${item._id}-${adIndex}`} className="text-center">
                                        <td className="p-2 border">{index + 1}</td>

                                        {[ad.img1, ad.img2, ad.img3].map((img, i) => (
                                            <td key={i} className="p-2 border">
                                                <a href={img.link} target="_blank" rel="noopener noreferrer">
                                                    <img src={img.img} alt={`Ad ${index + 1} Img ${i + 1}`} className="w-24 h-16 object-cover mx-auto rounded" />
                                                </a>
                                            </td>
                                        ))}
                                        <td className="p-2 border">{new Date(item.archivedAt).toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
        </>
    );
};

export default AdvertisementHistory;

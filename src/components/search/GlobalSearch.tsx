import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import { global_search } from '../../api/config';

const GlobalSearch: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        if (!searchTerm.trim()) return;
        setLoading(true);
        try {
            const response = await axios.get(`${global_search}?query=${encodeURIComponent(searchTerm)}`);
            console.log('Search response:', response.data.data);
            const searchResults = response.data.data || [];

            // Pass results to the next page via state
            navigate('/searchPage', { state: { searchResults } });
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full max-w-xl hidden sm:block ">
            <div className="flex sm:items-center fixed top-[6rem] left-0 w-[100vw] items-center justify-center sm:static sm:w-auto  rounded-full ">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                    className="border px-4 py-2 rounded-full w-[80%]  focus:outline-none shadow-sm "
                />
                <button onClick={fetchData} className="bg-[#f5d6ba] hover:bg-[#e9874644] text-[#E97451] p-2 rounded-full">
                    <SearchIcon />
                </button>
            </div>
        </div>
    );
};

export default GlobalSearch;

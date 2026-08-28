import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../cards/Card';
// import Card from '../cards/Card';

type ResultItem = {
    link: string;
    name: string;
    img: string;
    _id: string;
};

const SearchPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const results: ResultItem[] = location.state?.searchResults || [];
    console.log(results, 'results');

    // 🔁 Redirect back if no search data
    useEffect(() => {
        if (!location.state?.searchResults) {
            navigate('/');
        }
    }, [location.state, navigate]);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Search Results</h2>
            {results.length > 0 ? (
                <div className="flex justify-center flex-wrap items-center gap-4 py-8">
                    {results.map((item, index) => (
                        <Card id={item._id} key={index} link={item.link} name={item.name} img={item.img} />
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">No results found.</p>
            )}
        </div>
    );
};

export default SearchPage;

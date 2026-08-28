import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { display_all_action } from '../api/config';
import ActionCard from '../components/cards/ActionCard';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface ActionItem {
    action: string;
    link: string;
    img: string;
    _id: string;
}

const Action: React.FC = () => {
    const location = useLocation();
    const status = location.state?.usertype;

    const [details, setDetails] = useState<ActionItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!status) {
            setLoading(false);
            return;
        }

        const fetchActions = async () => {
            try {
                const { data } = await axios.get(`${display_all_action}/${status}`);
                setDetails(data);
            } catch (err) {
                console.error('Error fetching actions:', err);
                setError('Failed to load actions.');
            } finally {
                setLoading(false);
            }
        };

        fetchActions();
    }, [status]);

    if (!status) {
        return <h1 className="text-center text-2xl font-bold mt-10">No actions available</h1>;
    }

    const renderSkeletons = () => (
        <div className="flex flex-wrap gap-4 justify-center w-full">
            {[...Array(4)].map((_, idx) => (
                <Skeleton key={idx} height={240} width={240} className="rounded-xl" />
            ))}
        </div>
    );

    return (
        <div className="flex flex-col items-center p-4">
            <h1 className="text-2xl font-bold my-8 capitalize">{status}</h1>

            {loading ? (
                renderSkeletons()
            ) : error ? (
                <p className="">No actions available</p>
            ) : details.length > 0 ? (
                <div className="flex w-full flex-wrap gap-6 justify-center">
                    {details.map((item) => (
                        <ActionCard key={item._id} action={item.action} link={item.link} img={item.img} id={item._id} />
                    ))}
                </div>
            ) : (
                <p className="text-lg text-gray-500">No actions available</p>
            )}
        </div>
    );
};

export default Action;

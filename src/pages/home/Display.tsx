import { useEffect, useState } from 'react';
import axios from 'axios';
import { display_all_cards, display_all_head, delete_card } from '../../api/config';
import Card from '../../components/cards/Card';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import MobSearchPage from '../../components/search/MobSearchPage';
import NavButton from '../../components/button/NavButton';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddIcon from '@mui/icons-material/Add';

interface CardData {
    name: string;
    link: string;
    img: string;
    _id: string;
}

interface Headline {
    headline: string;
}

const HomeDisplay = () => {
    const [headlines, setHeadlines] = useState<Headline[]>([]);
    const [cardsByHeadline, setCardsByHeadline] = useState<Record<string, CardData[]>>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const { data } = await axios.get(display_all_head);
                const fetchedHeadlines: Headline[] = data.headlines || [];

                setHeadlines(fetchedHeadlines);

                if (!fetchedHeadlines.length) return;

                const cardsPromises = fetchedHeadlines.map(async ({ headline }) => {
                    try {
                        const res = await axios.get(`${display_all_cards}/${headline}`);
                        return { [headline]: res.data || [] };
                    } catch {
                        return { [headline]: [] };
                    }
                });

                const allCards = await Promise.all(cardsPromises);
                setCardsByHeadline(Object.assign({}, ...allCards));
            } catch {
                setError('Failed to load data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDelete = async (id: string) => {
        try {
            const response = await axios.delete(`${delete_card}/${id}`);
            console.log('Delete success:', response);
            toast.success('Card deleted successfully!', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            // Update state to remove the deleted card
            setCardsByHeadline((prev) => {
                const updated = { ...prev };
                Object.keys(updated).forEach((headline) => {
                    updated[headline] = updated[headline].filter((card) => card._id !== id);
                });
                return updated;
            });
            setTimeout(() => navigate('/HomeCard'), 1000);
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Failed to delete card.', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };
    const adminType = localStorage.getItem("adminType");
    return (
        <div>
        
            {/* ToastContainer for rendering toast notifications */}
            <ToastContainer />
            <div className="flex justify-end md:mt-[0rem] mt-[3rem]">

                {adminType === "super admin" && (
                    <NavButton to="/HomeCard/add">
                        <AddIcon />
                        <span className="ml-1">Create</span>
                        <span className='ml-1 md:block hidden'> Cards</span>
                    </NavButton>
                )}
            </div>
            <div className="flex flex-col items-center">
                <MobSearchPage />
                {loading && (
                    <SkeletonTheme>
                        {[1, 2, 3, 4].map((_, i) => (
                            <div key={i} className="w-full text-center my-4">
                                {/* Headline Skeleton */}
                                <Skeleton height={30} width={200} className="mx-auto mb-4" style={{ borderRadius: '8px' }} />
                                {/* Card Grid Skeletons */}
                                <div className="flex gap-4 flex-wrap justify-center pb-12">
                                    {[1, 2, 3, 4].map((_, j) => (
                                        <Skeleton key={j} height={240} width={240} className="rounded-xl" style={{ borderRadius: '1rem' }} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </SkeletonTheme>
                )}
                {!loading &&
                    !error &&
                    headlines.map(({ headline }) => (
                        <div key={headline} className="w-full text-center  ">
                            <h2 className="text-2xl font-bold my-8 font-cinzel">{headline}</h2>
                            <div className="flex gap-4 flex-wrap justify-center">
                                {cardsByHeadline[headline]?.length > 0 ? (
                                    cardsByHeadline[headline].map((card) => (
                                        <Card
                                            key={card._id}
                                            link={card.link}
                                            name={card.name}
                                            img={card.img}
                                            id={card._id}
                                            onDelete={handleDelete}
                                        />
                                    ))
                                ) : (
                                    <p className="col-span-2 text-gray-500 font-poppins">No cards available</p>
                                )}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default HomeDisplay;
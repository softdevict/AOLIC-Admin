import axios from "axios";
import React, { useEffect, useState } from "react";
// import MyDashboardCard from "./MyDashboardCard"; // adjust path
import { my_dashboard_1, my_dashboard_1_mod } from "../../../api/config";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import MyDashboardCard from "../mydashboardComponent/Card";
import NavButton from "../../../components/button/NavButton";
import { toast, ToastContainer } from "react-toastify";

interface CardType {
    _id: string;
    name: string;
    img: string;
    eventDisplay: boolean;
}

interface MyDashboardCardProps {
    img: string;
    name: string;
    onEdit: () => void;
    onDelete: () => void;
    navigateTo?: string | { pathname: string; state?: any }; // allow object also
    disabled?: boolean;
}


function First_My_Dashboard_View() {
    const [cards, setCards] = useState<CardType[]>([]);
    const navigate = useNavigate();
    const location = useLocation();
    console.log("🚀 ~ First_My_Dashboard_View ~ location:", location)
    const { root_Card_1 } = useParams();  // ✅ get :root_Card from URL
    console.log("🚀 ~ First_My_Dashboard_View ~ root_Card:", root_Card_1)



    useEffect(() => {
        // Fetch all cards
        axios
            .get(`${my_dashboard_1}/${root_Card_1}`)
            .then((res) => {
                if (res.data.success) {
                    setCards(res.data.data); // assuming API returns { success: true, data: [...] }
                }
            })
            .catch((err) => console.error(err));
    }, []);

    const deleteCard = (id: string) => {
        // Call delete API
        if (window.confirm("⚠️ Are you sure you want to delete this card?")) {
            axios
                .delete(`${my_dashboard_1_mod}/${id}`) // adjust API if needed
                .then((res) => {
                    if (res.data.success) {
                        setCards(cards.filter((card) => card._id !== id)); // remove deleted card
                        toast.success("Deleted successfully ");
                    }
                })
                .catch((err) => {
                    console.error(err);

                    // If using Axios
                    const message =
                        err.response?.data?.message || // server error message
                        err.message ||                  // JS error message
                        "Something went wrong";         // fallback

                    toast.error(message);
                });
        }
    }

    const handleEdit = (card: CardType) => {
        if (card.eventDisplay) {
            // For sub-event edit page - pass parent ID via state
            navigate(`/my_dashboard_1/edit-sub-event/${card._id}`, {
                state: { parentId: root_Card_1 }
            });
        } else {
            // For main event edit page (unchanged)
            navigate(`/my_dashboard_1/edit/${card._id}`, { state: { id: root_Card_1 } });
        }
    };
    return (
        <>
            <ToastContainer />
            <div className="">
                <ol className="flex text-gray-500 font-semibold dark:text-white-dark space-x-2">
                    <Link to="/">
                        <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Home</button>
                    </Link>
                    <li>/</li>
                    <Link to="/my_dashboard">
                        <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">My Dashboard</button>
                    </Link>
                    <li>/</li>
                    <li>
                        <button className="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70">
                            Nested 1
                        </button>
                    </li>
                </ol>
                <div className=" flex justify-end px-4 pb-8 gap-4">
                    <NavButton to={`/add-sub-event/form/${root_Card_1}`} className="mb-2">
                        Create New Sub Event
                    </NavButton>
                    <NavButton to={`/my_dashboard_1/form/${root_Card_1}`} className="mb-2">
                        Create New Card
                    </NavButton>
                </div>
                <div className="flex justify-center flex-wrap gap-8 p-4">
                    {cards.map((card) => (
                        <MyDashboardCard
                            key={card._id}
                            img={card.img}
                            name={card.name}
                            // Navigate to dashboard view when card clicked
                            // navigateTo={`/my_dashboard_2/${card._id}`}
                            navigateTo={{
                                pathname: `/my_dashboard_2/${card._id}`,
                                state: { d1: root_Card_1 }
                            }}
                            // Edit button navigates conditionally based on eventDisplay
                            onEdit={() => handleEdit(card)}
                            // Delete button calls delete function
                            onDelete={() => deleteCard(card._id)}
                        />
                    ))}
                </div>
            </div >
        </>
    );
}

export default First_My_Dashboard_View;
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import MyDashboardCard from "../mydashboardComponent/Card";
import NavButton from "../../../components/button/NavButton";
import { toast, ToastContainer } from "react-toastify";
import { my_dashboard_2, my_dashboard_2_mod } from "../../../api/config";

interface CardType {
    _id: string;
    name: string;
    img: string;
}

function Second_My_Dashboard_View() {
    const [cards, setCards] = useState<CardType[]>([]);
    const navigate = useNavigate();
    const location = useLocation();
    const { root_Card_2 } = useParams(); // ✅ get :root_Card_2 from URL

    // Safely access state values with fallbacks
    const nested_1 = location.state?.d1 || "";
    console.log("🚀 ~ Second_My_Dashboard_View ~ nested_1:", nested_1);

    useEffect(() => {
        axios
            .get(`${my_dashboard_2}/${root_Card_2}`)
            .then((res) => {
                if (res.data.success) {
                    setCards(res.data.data);
                }
            })
            .catch((err) => {
                console.error(err);
                toast.error("Failed to load cards.");
            });
    }, [root_Card_2]);

    const deleteCard = (id: string) => {
        if (window.confirm("⚠️ Are you sure you want to delete this card?")) {
            axios
                .delete(`${my_dashboard_2_mod}/${id}`)
                .then((res) => {
                    if (res.data.success) {
                        setCards(cards.filter((card) => card._id !== id));
                        toast.success("Deleted successfully");
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
    };

    return (
        <>
            <ToastContainer />
            {/* Breadcrumb */}
            <ol className="flex text-gray-500 font-semibold dark:text-white-dark space-x-2">
                <Link to="/">
                    <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Home</button>
                </Link>
                <li>/</li>
                <Link to={`/my_dashboard`}>
                    <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">My Dashboard</button>
                </Link>
                <li>/</li>
                <Link to={nested_1 ? `/my_dashboard_1/${nested_1}` : "/my_dashboard"}>
                    <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Nested 1</button>
                </Link>
                <li>/</li>
                <li>
                    <button className="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70">
                        Nested 2
                    </button>
                </li>
            </ol>

            {/* Actions */}
            <div className="mb-6">
                <div className="flex justify-end px-4 pb-8">
                    <NavButton
                        to={`/my_dashboard_2/form/${root_Card_2}`}
                        state={{ d1: nested_1, d2: root_Card_2 }}
                        className="mb-2"
                    >
                        Create New Card
                    </NavButton>
                </div>

                {/* Card list */}
                <div className="flex justify-center flex-wrap gap-8 p-4">
                    {cards.map((card) => (
                        <MyDashboardCard
                            key={card._id}
                            img={card.img}
                            name={card.name}
                            navigateTo={{
                                pathname: `/my_dashboard_3/${card._id}`,
                                state: { d1: nested_1, d2: root_Card_2 },
                            }}
                            onEdit={() =>
                                navigate(`/my_dashboard_2/edit/${card._id}`, {
                                    state: { id: root_Card_2, d1: nested_1, d2: root_Card_2 },
                                })
                            }
                            onDelete={() => deleteCard(card._id)}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}

export default Second_My_Dashboard_View;

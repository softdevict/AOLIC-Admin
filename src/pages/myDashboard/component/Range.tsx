import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Button from "../../../components/button/Button"; // Your Button component
import { Link } from "react-router-dom";
import axios from "axios";
import { geo_range } from "../../../api/config";

interface GeoRange {
    _id: string;
    range: number;
    createdAt: string;
}

const Range: React.FC = () => {
    const [range, setRange] = useState<number | "">("");
    const [currentGeoRange, setCurrentGeoRange] = useState<GeoRange | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [fetchLoading, setFetchLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

    // Fetch current geo range
    useEffect(() => {
        const fetchGeoRange = async () => {
            try {
                setFetchLoading(true);
                const response = await axios.get(geo_range);
                if (response.data.success && response.data.data.length > 0) {
                    const latestRange = response.data.data[0];
                    console.log("🚀 ~ fetchGeoRange ~ latestRange:", latestRange)
                    setCurrentGeoRange(latestRange);
                    setRange(latestRange.range);
                } else {
                    setCurrentGeoRange(null);
                    setRange("");
                }
            } catch (err) {
                console.error("Error fetching geo range:", err);
                toast.error("Failed to fetch geo range", {
                    position: "top-right",
                });
                setCurrentGeoRange(null);
                setRange("");
            } finally {
                setFetchLoading(false);
            }
        };

        fetchGeoRange();
    }, []);

    // Handle input change
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            setRange(value === "" ? "" : Number(value));
            setError("");
        } else {
            setError("Please enter a valid number");
        }
    };

    // Handle form submit
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (range === "" || isNaN(Number(range))) {
            setError("Please enter a valid range");
            return;
        }

        if (!currentGeoRange) {
            toast.error("No geo range found to update");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await axios.patch(`${geo_range}/${currentGeoRange._id}`, { range: Number(range) });

            // Update local state
            setCurrentGeoRange({ ...currentGeoRange, range: Number(range) });

            // Show success toast
            toast.success(`Geo range updated to ${range} meters`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        } catch (err) {
            console.error("Error updating geo range:", err);
            toast.error("Failed to update geo range", {
                position: "top-right",
            });
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
                <h2 className="text-xl font-bold mb-4">Update Geo Range</h2>
                <p>Loading...</p>
            </div>
        );
    }
    const adminType = localStorage.getItem("adminType");
    return (
        <>
            {adminType === "super admin" && (
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
                            Range
                        </button>
                    </li>
                </ol>
            )}
            <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md mt-10">

                <h2 className="text-xl font-bold mb-4">Update Proximity Control</h2>
                {currentGeoRange && (
                    <p className="text-gray-600 mb-4">
                        Current Proximity Control: <span className="font-semibold">{currentGeoRange.range} meters</span>
                    </p>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            value={range === "" ? "" : range.toString()}
                            onChange={handleChange}
                            placeholder="Enter new range"
                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? "border-red-400 bg-red-50" : "border-gray-300"
                                }`}
                        />
                        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                    </div>
                    <Button text="Update Range" loading={loading} />
                </form>

                {/* Toast container */}
                <ToastContainer />
            </div>
        </>
    );
};

export default Range;
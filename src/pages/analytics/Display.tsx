import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { count_of_user } from '../../api/config';
import { Link, useNavigate } from 'react-router-dom';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

function AnalyticsDisplay() {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(count_of_user);
                setCount(response.data.count);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const adminType = localStorage.getItem("adminType");

    return (
        <>
            {adminType === "super admin" && (
                <ol className="flex text-gray-500 font-semibold dark:text-white-dark space-x-2">
                    <Link to="/">
                        <button className="hover:text-gray-500/70 dark:hover:text-white-dark/70">Home</button>
                    </Link>
                    <li>/</li>
                    <li>
                        <button className="text-black dark:text-white-light hover:text-black/70 dark:hover:text-white-light/70">Analytics</button>
                    </li>
                </ol>
            )}

            <div className="w-full mt-8 flex flex-wrap gap-4 items-center justify-center">
                {loading ? (
                    <>
                        <SkeletonTheme baseColor="#e0dfdf" highlightColor="#f5f5f5">
                            <div
                                className="text-xl h-[10rem] w-[20rem] rounded-xl p-4"
                                style={{
                                    boxShadow: 'rgba(97, 75, 66, 0.7) 2px 2px 5px 0px',
                                    borderRadius: '4px',
                                }}
                            >
                                <Skeleton height="100%" borderRadius="1rem" />
                            </div>
                        </SkeletonTheme>
                        {adminType === "super admin" && (
                            <>
                                <SkeletonTheme baseColor="#e0dfdf" highlightColor="#f5f5f5">
                                    <div
                                        className="text-xl h-[10rem] w-[20rem] rounded-xl p-4"
                                        style={{
                                            boxShadow: 'rgba(97, 75, 66, 0.7) 2px 2px 5px 0px',
                                            borderRadius: '4px',
                                        }}
                                    >
                                        <Skeleton height="100%" borderRadius="1rem" />
                                    </div>
                                </SkeletonTheme>
                                <SkeletonTheme baseColor="#e0dfdf" highlightColor="#f5f5f5">
                                    <div
                                        className="text-xl h-[10rem] w-[20rem] rounded-xl p-4"
                                        style={{
                                            boxShadow: 'rgba(97, 75, 66, 0.7) 2px 2px 5px 0px',
                                            borderRadius: '4px',
                                        }}
                                    >
                                        <Skeleton height="100%" borderRadius="1rem" />
                                    </div>
                                </SkeletonTheme>
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <div
                            className="text-xl h-[10rem] w-[20rem] rounded-xl shadow-2xl flex justify-center items-center
                            transition-all duration-500 ease-in-out text-[#5A382D] hover:text-[#7B480F] hover:font-bold 
                            hover:shadow-2xl hover:scale-105 hover:px-9 flex-col cursor-pointer relative font-poppins"
                            style={{
                                boxShadow: 'rgba(97, 75, 66, 0.7) 2px 2px 5px 0px',
                                borderRadius: '4px',
                            }}
                        >
                            Total Users <br />
                            <span className="p-4 text-2xl">{count}</span>
                        </div>
                        {adminType === "super admin" && (
                            <>
                                <div
                                    className="text-xl h-[10rem] w-[20rem] rounded-xl shadow-2xl flex justify-center items-center
                                    transition-all duration-500 ease-in-out text-[#5A382D] hover:text-[#7B480F] hover:font-bold 
                                    hover:shadow-2xl hover:scale-105 hover:px-9 flex-col cursor-pointer relative font-poppins"
                                    style={{
                                        boxShadow: 'rgba(97, 75, 66, 0.7) 2px 2px 5px 0px',
                                        borderRadius: '4px',
                                    }}
                                    onClick={() => navigate('/analytics/linkLog')}
                                >
                                    User Link Logs
                                </div>
                                <div
                                    className="text-xl h-[10rem] w-[20rem] rounded-xl shadow-2xl flex justify-center items-center
                                    transition-all duration-500 ease-in-out text-[#5A382D] hover:text-[#7B480F] hover:font-bold 
                                    hover:shadow-2xl hover:scale-105 hover:px-9 flex-col cursor-pointer relative font-poppins"
                                    style={{
                                        boxShadow: 'rgba(97, 75, 66, 0.7) 2px 2px 5px 0px',
                                        borderRadius: '4px',
                                    }}
                                    onClick={() => navigate('/analytics/module_linkLog')}
                                >
                                    Module Link Logs
                                </div>
                                <div
                                    className="text-xl h-[10rem] w-[20rem] rounded-xl shadow-2xl flex justify-center items-center
                                    transition-all duration-500 ease-in-out text-[#5A382D] hover:text-[#7B480F] hover:font-bold 
                                    hover:shadow-2xl hover:scale-105 hover:px-9 flex-col cursor-pointer relative font-poppins"
                                    style={{
                                        boxShadow: 'rgba(97, 75, 66, 0.7) 2px 2px 5px 0px',
                                        borderRadius: '4px',
                                    }}
                                    onClick={() => navigate('/analytics/event_passes_linkLog')}
                                >
                                    Event Passes Link Logs
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

export default AnalyticsDisplay;
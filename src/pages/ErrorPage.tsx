import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, easeInOut, easeOut } from "framer-motion";

// Floating animation
const floatAnimation = {
    initial: { y: 0 },
    animate: {
        y: [0, -20, 0],
        transition: { duration: 3, repeat: Infinity, ease: easeInOut }
    }
};

// Fade-in animation
const fadeIn = {
    initial: { opacity: 0, y: 30 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: easeOut }
    }
};

const ErrorPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="h-screen flex flex-col justify-center items-center text-center bg-gradient-to-br from-yellow-300 via-yellow-400 to-orange-400 text-gray-800 px-2 absolute top-0 left-0 z-50 w-screen">
            {/* 404 Animated Number */}
            <motion.div
                variants={floatAnimation}
                initial="initial"
                animate="animate"
                className="mb-8"
            >
                <h1 className="text-[100px] md:text-[160px] font-black tracking-widest drop-shadow-2xl text-gray-800">
                    404
                </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.div
                variants={fadeIn}
                initial="initial"
                animate="animate"
                className="mb-4"
            >
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mt-2 mb-1">
                    Oops! Page Not Found
                </h2>
                <p className="text-base opacity-80 text-gray-800">
                    The page you're looking for doesn't exist or has been moved.
                </p>
            </motion.div>

            {/* Button */}
            <motion.div
                variants={fadeIn}
                initial="initial"
                animate="animate"
            >
                <button
                    className="bg-gray-800 text-yellow-300 px-4 py-1.5 font-semibold rounded-full hover:bg-gray-600 transition-colors duration-200"
                    onClick={() => navigate("/")}
                >
                    Go Back Home
                </button>
            </motion.div>
        </div>
    );
};

export default ErrorPage;
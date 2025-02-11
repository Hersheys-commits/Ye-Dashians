import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Search, MapPin, User, MessageCircle, Sparkles } from "lucide-react";
import { motion, useViewportScroll, useTransform } from "framer-motion";
import axios from "axios";
import { useForm } from "react-hook-form";
import { login } from "../store/authSlice";
import Header from "../components/Header";
import api from "../utils/axiosRequest";
import myVideo from "../assets/135658-764361528.mp4";

function HomePage() {
    const navigate = useNavigate();
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [placeQuery, setPlaceQuery] = useState("");
    const [placeSuggestions, setPlaceSuggestions] = useState([]);
    const [selectedPlaceSuggestion, setSelectedPlaceSuggestion] =
        useState(null);
    const [isPlaceLoading, setIsPlaceLoading] = useState(false);
    const dispatch = useDispatch();

    const { register, handleSubmit, watch, setValue } = useForm({
        defaultValues: { username: "" },
    });
    const username = watch("username");

    // Fetch user data and store in Redux/localStorage
    const dataSave = async () => {
        try {
            const response = await api.get("/api/users/profile", {
                withCredentials: true,
            });
            dispatch(
                login({
                    user: response.data.data.user,
                    accessToken: response.data.data.accessToken,
                })
            );
            localStorage.setItem("user", JSON.stringify(response.data.data));
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    useEffect(() => {
        dataSave();
    }, []);

    // User search handler
    const handleUsernameChange = async (value) => {
        if (value === "") {
            setSuggestions([]);
            return;
        }
        if (value.length > 2) {
            setIsLoading(true);
            try {
                const response = await api.get(
                    `/api/friends/search?query=${value}`,
                    {
                        withCredentials: true,
                    }
                );
                setSuggestions(response.data.data || []);
            } catch (error) {
                console.error("Error fetching suggestions:", error);
                setSuggestions([]);
            } finally {
                setIsLoading(false);
            }
        } else {
            setSuggestions([]);
        }
    };

    // Place search handler
    const handlePlaceInputChange = async (e) => {
        const value = e.target.value;
        if (value.trim() === "") {
            setSelectedPlaceSuggestion([]);
            setPlaceQuery("");
            return;
        }
        setPlaceQuery(value);
        setSelectedPlaceSuggestion(null);
        if (value.length > 2) {
            setIsPlaceLoading(true);
            try {
                const response = await api.get(
                    `/api/places/autocomplete?query=${value}`,
                    { withCredentials: true }
                );
                setPlaceSuggestions(response.data.data || []);
            } catch (error) {
                console.error("Error fetching place suggestions:", error);
                setPlaceSuggestions([]);
            } finally {
                setIsPlaceLoading(false);
            }
        } else {
            setPlaceSuggestions([]);
        }
    };

    const onSubmit = (data) => {
        if (data.username) {
            navigate(`/profile/${data.username}`);
        }
    };

    const handlePlaceSubmit = (e) => {
        e.preventDefault();
        if (selectedPlaceSuggestion) {
            navigate(`/place/${selectedPlaceSuggestion.place_id}`);
        } else if (placeSuggestions.length === 1) {
            navigate(`/place/${placeSuggestions[0].place_id}`);
        } else {
            alert("Please select a valid place suggestion.");
        }
    };

    // Framer Motion variants for lower content
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, staggerChildren: 0.2 },
        },
    };
    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 },
    };

    // ---------------------------
    // SCROLL ANIMATION FOR HEADER
    // ---------------------------
    const { scrollY } = useViewportScroll();
    // As user scrolls from 0 to 150px, the header scales from 1 to 0.6
    const headerScale = useTransform(scrollY, [0, 150], [1, 0.6]);
    // Move header upward as the user scrolls
    const headerY = useTransform(scrollY, [0, 150], [0, -150]);
    // Fade out the header gradually
    const headerOpacity = useTransform(scrollY, [0, 150], [1, 0]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-base-200 to-base-300">
            <Header />

            {/* 
        Fullscreen header with SVG masked video text.
        Initially, it occupies the whole screen.
        Its scale, vertical position, and opacity animate based on scroll.
      */}
            <motion.div
                className="relative flex items-center justify-center w-full mb-10"
                style={{
                    scale: headerScale,
                    y: headerY,
                    opacity: headerOpacity,
                }}
            >
                <svg
                    viewBox="0 0 800 200"
                    className="w-full h-auto mx-auto"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <mask id="text-mask">
                            <rect width="100%" height="100%" fill="black" />
                            <text
                                x="50%"
                                y="40%"
                                dominantBaseline="middle"
                                textAnchor="middle"
                                fontSize="80"
                                fontWeight="900"
                                fill="white"
                                style={{ fontFamily: "Impact, sans-serif" }}
                            >
                                Connect with
                            </text>
                            <text
                                x="50%"
                                y="80%"
                                dominantBaseline="middle"
                                textAnchor="middle"
                                fontSize="100"
                                fontWeight="900"
                                fill="white"
                                style={{ fontFamily: "Impact, sans-serif" }}
                            >
                                Friends
                            </text>
                        </mask>
                    </defs>
                    {/* The video shows only through the masked (white) text */}
                    <foreignObject
                        width="100%"
                        height="100%"
                        mask="url(#text-mask)"
                    >
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        >
                            <source src={myVideo} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </foreignObject>
                </svg>
            </motion.div>

            {/* Main Content appears beneath the header */}
            <motion.main
                className="container mx-auto px-4 py-12 -mt-20" // negative margin to start overlapping as header shrinks
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <motion.div
                    className="max-w-3xl mx-auto text-center mb-12"
                    variants={itemVariants}
                >
                    <p className="text-lg text-base-content/70">
                        Discover, Connect, and Meet at the Perfect Spot
                    </p>
                </motion.div>

                <div className="max-w-2xl mx-auto space-y-6">
                    {/* User Search Card */}
                    <motion.div
                        variants={itemVariants}
                        className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300"
                    >
                        <div className="card-body">
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="relative">
                                    <div className="join w-full">
                                        <div className="join-item flex items-center px-3 bg-base-200">
                                            <Search className="w-5 h-5 text-base-content/50" />
                                        </div>
                                        <input
                                            type="text"
                                            {...register("username")}
                                            onChange={(e) => {
                                                setValue(
                                                    "username",
                                                    e.target.value
                                                );
                                                handleUsernameChange(
                                                    e.target.value
                                                );
                                            }}
                                            placeholder="Search by username..."
                                            className="input join-item w-full focus:outline-none pl-3 bg-transparent"
                                        />
                                        {isLoading && (
                                            <div className="join-item flex items-center pr-4 bg-base-200">
                                                <span className="loading loading-spinner loading-sm text-primary"></span>
                                            </div>
                                        )}
                                    </div>

                                    {suggestions?.length > 0 && (
                                        <motion.ul
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="absolute z-10 w-full bg-base-100 rounded-lg mt-2 shadow-xl border border-base-300 overflow-hidden backdrop-blur-sm bg-opacity-95"
                                        >
                                            {suggestions.map((user) => (
                                                <motion.li
                                                    key={user._id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    onClick={() => {
                                                        setValue(
                                                            "username",
                                                            user.username
                                                        );
                                                        setSuggestions([]);
                                                    }}
                                                    className="flex items-center p-3 hover:bg-base-200 cursor-pointer transition-all duration-300 border-b border-base-300 last:border-none hover:pl-6"
                                                >
                                                    {user?.avatar ? (
                                                        <img
                                                            src={user?.avatar}
                                                            alt="profile"
                                                            className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <User className="w-6 h-6 text-primary" />
                                                        </div>
                                                    )}
                                                    <div className="ml-4">
                                                        <p className="text-base-content font-medium">
                                                            {user.username}
                                                        </p>
                                                        <p className="text-base-content/70 text-sm">
                                                            {user.fullName}
                                                        </p>
                                                    </div>
                                                </motion.li>
                                            ))}
                                        </motion.ul>
                                    )}
                                </div>

                                <motion.div
                                    className="card-actions justify-center mt-4"
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <button
                                        type="submit"
                                        disabled={!username}
                                        className="btn btn-primary w-full shadow-lg hover:shadow-primary/30 transition-all duration-300"
                                    >
                                        <Search className="w-5 h-5 mr-2" />
                                        Search User
                                    </button>
                                </motion.div>
                            </form>
                        </div>
                    </motion.div>

                    {/* Place Search Card */}
                    <motion.div
                        variants={itemVariants}
                        className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-300"
                    >
                        <div className="card-body">
                            <form onSubmit={handlePlaceSubmit}>
                                <div className="relative">
                                    <div className="join w-full">
                                        <div className="join-item flex items-center px-3 bg-base-200">
                                            <MapPin className="w-5 h-5 text-base-content/50" />
                                        </div>
                                        <input
                                            type="text"
                                            value={placeQuery}
                                            onChange={handlePlaceInputChange}
                                            placeholder="Search for a place by name or address..."
                                            className="input input-bordered join-item w-full focus:outline-none pl-3"
                                        />
                                        {isPlaceLoading && (
                                            <div className="join-item flex items-center pr-4 bg-base-200">
                                                <span className="loading loading-spinner loading-sm"></span>
                                            </div>
                                        )}
                                    </div>

                                    {placeSuggestions?.length > 0 && (
                                        <ul className="absolute z-10 w-full bg-base-100 rounded-lg mt-2 shadow-xl border border-base-300 overflow-hidden">
                                            {placeSuggestions.map(
                                                (suggestion) => (
                                                    <li
                                                        key={
                                                            suggestion.place_id
                                                        }
                                                        onClick={() => {
                                                            setPlaceQuery(
                                                                suggestion.description
                                                            );
                                                            setSelectedPlaceSuggestion(
                                                                suggestion
                                                            );
                                                            setPlaceSuggestions(
                                                                []
                                                            );
                                                        }}
                                                        className="flex items-center p-3 hover:bg-base-200 cursor-pointer transition-colors border-b border-base-300 last:border-none"
                                                    >
                                                        <MapPin className="w-5 h-5 text-base-content/50 mr-3" />
                                                        <div>
                                                            <p className="text-base-content font-medium">
                                                                {
                                                                    suggestion.description
                                                                }
                                                            </p>
                                                        </div>
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    )}
                                </div>

                                <div className="card-actions justify-center mt-4">
                                    <button
                                        type="submit"
                                        disabled={!placeQuery}
                                        className="btn btn-primary w-full"
                                    >
                                        <Search className="w-5 h-5 mr-2" />
                                        Search Place
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ scale: 1.05 }}
                            className="card bg-base-100 shadow-xl"
                        >
                            <div className="card-body p-4">
                                <button
                                    onClick={() => navigate("/meeting")}
                                    className="btn btn-accent w-full h-full min-h-[100px] flex flex-col gap-2 shadow-lg hover:shadow-accent/30 transition-all duration-300"
                                >
                                    <MapPin className="w-6 h-6" />
                                    <span className="text-lg">
                                        Plan a Meeting
                                    </span>
                                </button>
                            </div>
                        </motion.div>

                        <motion.div
                            variants={itemVariants}
                            whileHover={{ scale: 1.05 }}
                            className="card bg-base-100 shadow-xl"
                        >
                            <div className="card-body p-4">
                                <button
                                    onClick={() => navigate("/message")}
                                    className="btn btn-primary w-full h-full min-h-[100px] flex flex-col gap-2 shadow-lg hover:shadow-primary/30 transition-all duration-300"
                                >
                                    <MessageCircle className="w-6 h-6" />
                                    <span className="text-lg">
                                        Chat with Friends
                                    </span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.main>
        </div>
    );
}

export default HomePage;

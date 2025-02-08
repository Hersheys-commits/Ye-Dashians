import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import api from "../utils/axiosRequest";

// Custom hook to check authentication status using api.
function useAuthStatus() {
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        async function checkAuth() {
            try {
                const response = await api.get(
                    "/api/users/current-user",
                    { withCredentials: true } // ensures cookies (even HTTP-only ones) are sent
                );

                // Assuming a successful response does not include an "error" field.
                if (response.data && !response.data.error) {
                    setIsLoggedIn(true);
                    // Adjust property path if your API wraps user data differently.
                    setUser(response.data.user || response.data);
                } else {
                    setIsLoggedIn(false);
                    setUser(null);
                }
            } catch (error) {
                setIsLoggedIn(false);
                setUser(null);
            }
            setLoading(false);
        }
        checkAuth();
    }, []);

    return { loading, isLoggedIn, user };
}

const Header = () => {
    const navigateTo = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    // Use the custom hook to determine the auth status.
    const { loading, isLoggedIn, user } = useAuthStatus();

    const handleLogout = async () => {
        try {
            const res = await api.get("/api/users/logout", {
                withCredentials: true,
            });
            console.log("api request", res);
            dispatch(logout());
            toast.success("Logged out successfully.");
            navigateTo("/login");
        } catch (error) {
            console.error("Logout failed:", error);
            toast.error("Failed to logout.");
        }
    };

    const clickSignup = () => {
        navigateTo("/signup");
    };

    const clickLogin = () => {
        navigateTo("/login");
    };

    // Render a skeleton header while checking auth status.
    if (loading) {
        return (
            <header className="navbar bg-base-100 skeleton">
                <div className="navbar-start">
                    <div className="skeleton w-32 h-8"></div>
                </div>
                <div className="navbar-end">
                    <div className="skeleton w-24 h-10"></div>
                </div>
            </header>
        );
    }

    return (
        <header className="navbar bg-base-300">
            <div className="navbar-start">
                <div
                    className="btn btn-ghost text-xl text-primary cursor-pointer"
                    onClick={() => navigateTo("/")}
                >
                    Nexus
                </div>
            </div>

            <div className="navbar-end">
                {!isLoggedIn ? (
                    <div className="space-x-2">
                        <button
                            className="btn btn-outline"
                            onClick={clickSignup}
                        >
                            Sign Up
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={clickLogin}
                        >
                            Login
                        </button>
                    </div>
                ) : (
                    <div className="dropdown dropdown-end">
                        <div
                            tabIndex={0}
                            role="button"
                            className="btn btn-ghost"
                        >
                            {user?.fullName || "User"}
                            <svg
                                className="w-4 h-4 ml-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </div>
                        <ul
                            tabIndex={0}
                            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                        >
                            {/* Only render the Home link if not already on it */}
                            {location.pathname !== "/" && (
                                <li>
                                    <Link to="/">Home</Link>
                                </li>
                            )}
                            {location.pathname !== "/user/profile" && (
                                <li>
                                    <Link to="/user/profile">Profile</Link>
                                </li>
                            )}
                            {location.pathname !== "/message" && (
                                <li>
                                    <Link to="/message">Chat</Link>
                                </li>
                            )}
                            {location.pathname !== "/settings" && (
                                <li>
                                    <Link to="/settings">Settings</Link>
                                </li>
                            )}
                            <li>
                                <a
                                    className="text-error"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </a>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;

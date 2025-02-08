import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import Cookies from "js-cookie";

const Header = () => {
    const navigateTo = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    // Retrieve user info from localStorage.
    const userInfo = JSON.parse(localStorage.getItem("user"));
    let isLoggedIn = false;
    if (userInfo && Cookies.get("accessToken")) isLoggedIn = true;

    const handleLogout = async () => {
        try {
            await axios.post(
                "https://nexus-xwdr.onrender.com/api/users/logout",
                {},
                { withCredentials: true }
            );

            dispatch(logout());
            localStorage.removeItem("user");

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

    if (typeof isLoggedIn === "undefined") {
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
                            {userInfo?.user?.fullName || "User"}
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
                            {/* Only render the Profile link if we are NOT already on the profile page */}
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

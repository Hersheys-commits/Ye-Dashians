import React from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import Cookies from "js-cookie"

const Header = () => {
    const navigateTo = useNavigate();
    const dispatch = useDispatch();

    // const { isLoggedIn, userInfo } = useSelector((store) => store.auth);
    const userInfo = JSON.parse(localStorage.getItem("user"));
    var isLoggedIn = false;
    if (userInfo && Cookies.get("accessToken")) isLoggedIn = true;

    // const persistLoaded = useSelector((state) => state._persist?.rehydrated);

    // if (!persistLoaded) {
    //   return (
    //     <header className="navbar bg-base-100 skeleton">
    //       <div className="navbar-start">
    //         <div className="skeleton w-32 h-8"></div>
    //       </div>
    //       <div className="navbar-end">
    //         <div className="skeleton w-24 h-10"></div>
    //       </div>
    //     </header>
    //   );
    // }

    const handleLogout = async () => {
        try {
            await axios.post(
                "http://localhost:4001/api/users/logout",
                {},
                {
                    withCredentials: true,
                }
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
                    YeDashians
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
                            {userInfo?.name || "User"}
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
                            <li>
                                <a onClick={() => navigateTo("/user/profile")}>
                                    Profile
                                </a>
                            </li>
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

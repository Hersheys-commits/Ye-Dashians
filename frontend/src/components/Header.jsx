import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useSelector } from 'react-redux';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(useSelector((store)=>store.auth.isLoggedIn));
  const [userInfo, setUserInfo] = useState(useSelector((store)=>store.auth.userInfo));
  const navigateTo = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const user = localStorage.getItem("user");
    
    if (token && user) {
      setIsLoggedIn(true);
      setUserInfo(JSON.parse(user)); // Parse the user data from localStorage
    }
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("jwt");
      if (!token) {
        toast.error("No token found for logout.");
        return;
      }

      await axios.post(
        "http://localhost:4001/api/users/logout",
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      // Clear localStorage and update state
      localStorage.removeItem("jwt");
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      setUserInfo(null);

      toast.success("Logged out successfully.");
      navigateTo("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to logout.");
    }
  };

  const clickSignup = () => {
    toast.success("Redirect to Signup");
    navigateTo("/signup");
  };

  const clickLogin = () => {
    toast.success("Redirect to Login");
    navigateTo("/login");
  };

  return (
    <header className="flex justify-between items-center p-4 bg-white shadow-md">
      {/* Logo */}
      <div className="text-xl font-bold text-red-500">YeDashians</div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        {!isLoggedIn ? (
          <>
            <button className="border border-gray-300 px-4 py-2 rounded" onClick={clickSignup}>
              Sign Up
            </button>
            <button className="px-4 py-2 rounded bg-red-500 text-white" onClick={clickLogin}>
              Login
            </button>
          </>
        ) : (
          <div className="relative">
            <button className="flex items-center space-x-2">
              <span className="font-bold">{userInfo?.name || "User"}</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded">
              <div className="flex flex-col space-y-2 p-2">
                <button
                  className="text-left p-2 hover:bg-gray-100"
                  onClick={() => navigateTo("/user/profile")}
                >
                  Profile
                </button>
                <button
                  className="text-left p-2 text-red-500 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

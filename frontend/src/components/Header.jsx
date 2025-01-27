import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

const Header = () => {
  const navigateTo = useNavigate();
  const dispatch = useDispatch();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const { isLoggedIn, userInfo } = useSelector((store) => store.auth);

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
      setIsDropdownOpen(false);
      
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

  if (typeof isLoggedIn === 'undefined') {
    return (
      <header className="flex justify-between items-center p-4 bg-white shadow-md">
        <div className="text-xl font-bold text-red-500">YeDashians</div>
        <div className="w-24 h-8 bg-gray-200 animate-pulse rounded"></div>
      </header>
    );
  }

  return (
    <header className="flex justify-between items-center p-4 bg-white shadow-md">
      {/* Logo */}
      <div className="text-xl font-bold text-red-500 cursor-pointer" onClick={() => navigateTo('/')}>
        YeDashians
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        {!isLoggedIn ? (
          <>
            <button 
              className="border border-gray-300 px-4 py-2 rounded hover:bg-gray-50 transition-colors" 
              onClick={clickSignup}
            >
              Sign Up
            </button>
            <button 
              className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition-colors" 
              onClick={clickLogin}
            >
              Login
            </button>
          </>
        ) : (
          <div className="relative">
            <button 
              className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="font-bold">{userInfo?.name || "User"}</span>
              {/* Optional: Add a dropdown arrow */}
              <svg 
                className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isDropdownOpen && (
              <>
                {/* Invisible overlay to handle clicking outside */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsDropdownOpen(false)}
                />
                
                {/* Dropdown menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md overflow-hidden z-20">
                  <div className="py-1">
                    <button
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => {
                        navigateTo("/user/profile");
                        setIsDropdownOpen(false);
                      }}
                    >
                      Profile
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 transition-colors"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
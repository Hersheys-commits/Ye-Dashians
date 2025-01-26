import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const Header = () => {
  const { isLoggedIn, userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigateTo = useNavigate();

  const handleLogout = async () => {
    try {
      // Retrieve the token from localStorage
      const token = localStorage.getItem("jwt");
  
      // Send the logout request with the token
      await axios.post(
        "http://localhost:4001/api/users/logout",
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,  // Add token here
          },
        }
      );
      dispatch(logout());  // Dispatch the logout action to clear the state
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Failed to logout");
    }
  };
  

  const clickSignup = () => {
    toast.success('Redirect to Signup');
    navigateTo('/signup');
  };

  const clickLogin = () => {
    toast.success('Redirect to Login');
    navigateTo('/login');
  };

  return (
    <header className="flex justify-between items-center p-4 bg-white shadow-md">
      {/* Logo */}
      <div className="text-xl font-bold text-red-500">YeDashians</div>

      {/* Actions */}
      <div className="flex items-center space-x-4">
        {!isLoggedIn ? (
          <>
            <button className="border border-gray-300 px-4 py-2 rounded" onClick={clickSignup}>Sign Up</button>
            <button className="px-4 py-2 rounded bg-red-500 text-white" onClick={clickLogin}>Login</button>
          </>
        ) : (
          <div className="relative">
            <button className="flex items-center space-x-2">
              <span className="font-bold">{userInfo.name}</span>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded">
              <div className="flex flex-col space-y-2 p-2">
                <button
                  className="text-left p-2 hover:bg-gray-100"
                  onClick={() => alert('Go to Profile')}
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

import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { login } from '../store/authSlice';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie'

function HomePage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [suggestions, setSuggestions] = useState([]); // Ensure this is always initialized as an array
  const token = localStorage.getItem('jwt');
  const accessToken = Cookies.get('accessToken');
  console.log('cookie',accessToken);
  
  const user= useSelector((store)=>store.auth.isLoggedIn)
  const dispatch = useDispatch();
  console.log("state",user)

    const dataSave = async () => {
      try {
        const response = await axios.get('http://localhost:4001/api/users/profile',{
          withCredentials: true,
        });
    
        // Serialize the JSON object into a string before storing it
        dispatch(
          login({
            user: response.data.data.user, // Pass the user object
            accessToken: response.data.data.accessToken, // Pass the access token
          })
        );
        localStorage.setItem("user", JSON.stringify(response.data.data));
        console.log("User data saved to localStorage");
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    useEffect(()=>{
      dataSave();
    },[]);  
    
  const handleUsernameChange = async (e) => {
    const value = e.target.value;
    setUsername(value);

    if (value.length > 2) {
      try {
        const response = await axios.get(`/api/users/search?query=${value}`, {
          withCredentials:true,
        });
        setSuggestions(response.data.data || []); // Ensure response data defaults to an empty array
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]); // Clear suggestions for inputs with length <= 2
    }
  };

  const handleSearch = () => {
    if (username) {
      navigate(`/profile/${username}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Search username"
              className="w-full p-2 border rounded"
            />
            {suggestions?.length > 0 && ( // Use optional chaining here
              <ul className="absolute z-10 w-full bg-white border rounded mt-1 shadow-lg">
                {suggestions.map((user) => (
                  <li 
                    key={user._id}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setUsername(user.username);
                      setSuggestions([]);
                    }}
                  >
                    {user.username} ({user.fullName})
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="mt-4 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Search User
          </button>
        </div>

        <button
          className="mt-5 px-4 py-2 rounded bg-red-500 text-white"
          onClick={() => navigate('/meeting')}
        >
          Select Meeting
        </button>
        
      </div>
    </div>
  );
}

export default HomePage;

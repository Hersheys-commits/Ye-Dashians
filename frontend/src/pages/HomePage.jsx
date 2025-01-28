import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, MapPin, User } from 'lucide-react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { login } from '../store/authSlice';
import Header from '../components/Header';

function HomePage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const user = useSelector((store) => store.auth.isLoggedIn);
  const dispatch = useDispatch();
  
  const accessToken = Cookies.get('accessToken');

  const dataSave = async () => {
    try {
      const response = await axios.get('http://localhost:4001/api/users/profile', {
        withCredentials: true,
      });
      
      dispatch(login({
        user: response.data.data.user,
        accessToken: response.data.data.accessToken,
      }));
      
      localStorage.setItem("user", JSON.stringify(response.data.data));
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    dataSave();
  }, []);

  const handleUsernameChange = async (e) => {
    const value = e.target.value;
    setUsername(value);
    
    if (value.length > 2) {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/users/search?query=${value}`, {
          withCredentials: true,
        });
        setSuggestions(response.data.data || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSearch = () => {
    if (username) {
      navigate(`/profile/${username}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Connect with Friends
          </h1>
          <p className="text-lg text-gray-600">
            Search for users and plan meetings with your connections
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="relative">
              <div className="flex items-center border-2 border-gray-200 rounded-lg focus-within:border-blue-500 transition-colors">
                <Search className="w-5 h-5 text-gray-400 ml-3" />
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder="Search by username..."
                  className="w-full p-3 pl-3 outline-none text-gray-700 placeholder-gray-400"
                />
                {isLoading && (
                  <div className="mr-3">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {suggestions?.length > 0 && (
                <ul className="absolute z-10 w-full bg-white rounded-lg mt-2 shadow-xl border border-gray-100 overflow-hidden">
                  {suggestions.map((user) => (
                    <li 
                      key={user._id}
                      onClick={() => {
                        setUsername(user.username);
                        setSuggestions([]);
                      }}
                      className="flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-none"
                    >
                      <User className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-gray-800 font-medium">{user.username}</p>
                        <p className="text-gray-500 text-sm">{user.fullName}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              onClick={handleSearch}
              disabled={!username}
              className="w-full mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Search User
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <button
              onClick={() => navigate('/meeting')}
              className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
            >
              <MapPin className="w-5 h-5" />
              Plan a Meeting
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomePage;
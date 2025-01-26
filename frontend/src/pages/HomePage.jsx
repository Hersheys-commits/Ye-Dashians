import React, { useState } from 'react';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function HomePage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [suggestions, setSuggestions] = useState([]); // Ensure this is always initialized as an array

  const handleUsernameChange = async (e) => {
    const value = e.target.value;
    setUsername(value);

    if (value.length > 2) {
      try {
        const response = await axios.get(`/api/users/search?query=${value}`, {
          headers: { 
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}` 
          }
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

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, MapPin, User } from 'lucide-react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useForm } from 'react-hook-form';
import { login } from '../store/authSlice';
import Header from '../components/Header';

function HomePage() {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const user = useSelector((store) => store.auth.userInfo);
  console.log("stateuser",user)
  const dispatch = useDispatch();
  
  const accessToken = Cookies.get('accessToken');

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      username: '',
    },
  });

  const username = watch('username');

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

  const handleUsernameChange = async (value) => {
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

  const onSubmit = (data) => {
    if (data.username) {
      navigate(`/profile/${data.username}`);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-base-content mb-4">
            Connect with Friends
          </h1>
          <p className="text-lg text-base-content/70">
            Search for users and plan meetings with your connections
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="relative">
                  <div className="join w-full">
                    <div className="join-item flex items-center px-3 bg-base-200">
                      <Search className="w-5 h-5 text-base-content/50" />
                    </div>
                    <input
                      type="text"
                      {...register('username')}
                      onChange={(e) => {
                        setValue('username', e.target.value);
                        handleUsernameChange(e.target.value);
                      }}
                      placeholder="Search by username..."
                      className="input input-bordered join-item w-full focus:outline-none pl-3"
                    />
                    {isLoading && (
                      <div className="join-item flex items-center pr-4 bg-base-200">
                        <span className="loading loading-spinner loading-sm"></span>
                      </div>
                    )}
                  </div>

                  {suggestions?.length > 0 && (
                    <ul className="absolute z-10 w-full bg-base-100 rounded-lg mt-2 shadow-xl border border-base-300 overflow-hidden">
                      {suggestions.map((user) => (
                        <li 
                          key={user._id}
                          onClick={() => {
                            setValue('username', user.username);
                            setSuggestions([]);
                          }}
                          className="flex items-center p-3 hover:bg-base-200 cursor-pointer transition-colors border-b border-base-300 last:border-none"
                        >
                          <User className="w-5 h-5 text-base-content/50 mr-3" />
                          <div>
                            <p className="text-base-content font-medium">{user.username}</p>
                            <p className="text-base-content/70 text-sm">{user.fullName}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="card-actions justify-center mt-4">
                  <button
                    type="submit"
                    disabled={!username}
                    className="btn btn-primary w-full"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Search User
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <button
                onClick={() => navigate('/meeting')}
                className="btn btn-accent w-full"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Plan a Meeting
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomePage;
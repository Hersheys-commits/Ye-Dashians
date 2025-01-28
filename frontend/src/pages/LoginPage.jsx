import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { login} from '../store/authSlice';

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigateTo = useNavigate();
  const dispatch = useDispatch(); // Use the dispatch hook

  const onSubmit = async (data) => {
    const { email, password } = data; // Extract email and password from form data
    try {
      const response = await axios.post(
        "http://localhost:4001/api/users/login",
        { email, password },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // console.log("Login",response);
      toast.success(response.data.message || "User logged in successfully");

      // Save the token to localStorage
      // localStorage.setItem("jwt", response.data.data.accessToken);

      // Dispatch the login action to update the store with user info
      dispatch(
        login({
          user: response.data.data.user, // Pass the user object
          accessToken: response.data.data.accessToken, // Pass the access token
        })
      );

      // Redirect to home page
      navigateTo("/");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.errors || "User login failed"
      );
    }
  };
  

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded-2xl shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

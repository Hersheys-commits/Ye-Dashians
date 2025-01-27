import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const SignupPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigateTo = useNavigate();

  const onSubmit = async (data) => {
    const { fullName, username, email, password } = data; // Extract name, email, and password from form data
    try {
      const response = await axios.post(
        "http://localhost:4001/api/users/register",
        { fullName, username, email, password },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.data);
      toast.success(response.data.message || "User registered successfully");
      navigateTo("/login"); // Redirect to login page after successful signup
    } catch (error) {
        console.log(error);
        if (error.response && error.response.status === 409) {
            // Display conflict error (e.g., email or username already taken)
            toast.error(error.response.data.message || "Conflict during registration");
          } else {
            console.error(error);
            toast.error("Registration failed");
          }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded-2xl shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" htmlFor="fullName">
                Name
            </label>
            <input
              id="fullName"
              type="text"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('fullName', { required: 'Name is required' })}
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
            )}
          </div>
          <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('username', { required: 'Userame is required' })}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
            )}
          </div>

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
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 3,
                  message: 'Password must be at least 3 characters long',
                },
              })}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Sign Up
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
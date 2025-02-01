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
    const { fullName, username, email, password } = data;
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
      navigateTo("/login");
    } catch (error) {
        console.log(error);
        if (error.response && error.response.status === 409) {
            toast.error(error.response.data.message || "Conflict during registration");
          } else {
            console.error(error);
            toast.error("Registration failed");
          }
    }
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content flex-col">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold mb-5">Sign Up</h1>
        </div>
        <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
          <form className="card-body" onSubmit={handleSubmit(onSubmit)}>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input 
                type="text" 
                placeholder="Full Name" 
                className={`input input-bordered ${errors.fullName ? 'input-error' : ''}`}
                {...register('fullName', { required: 'Name is required' })}
              />
              {errors.fullName && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.fullName.message}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Username</span>
              </label>
              <input 
                type="text" 
                placeholder="Username" 
                className={`input input-bordered ${errors.username ? 'input-error' : ''}`}
                {...register('username', { required: 'Username is required' })}
              />
              {errors.username && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.username.message}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input 
                type="email" 
                placeholder="Email" 
                className={`input input-bordered ${errors.email ? 'input-error' : ''}`}
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.email.message}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input 
                type="password" 
                placeholder="Password" 
                className={`input input-bordered ${errors.password ? 'input-error' : ''}`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 3,
                    message: 'Password must be at least 3 characters long',
                  },
                })}
              />
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.password.message}</span>
                </label>
              )}
            </div>

            <div className="form-control mt-6">
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                Sign Up
              </button>
            </div>
          </form>
        </div>
        <div className="text-center">
          <p className="text-sm">
            Already have an account?{' '}
            <Link to="/login" className="link link-primary">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
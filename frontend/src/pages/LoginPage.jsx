import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { useDispatch } from "react-redux";
import { login } from "../store/authSlice";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import useGoogleAuth from "../utils/authUtil";
import api from "../utils/axiosRequest";

const LoginPage = () => {
    const { handleGoogleSuccess, handleGoogleFailure } = useGoogleAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const navigateTo = useNavigate();
    const dispatch = useDispatch();

    const onSubmit = async (data) => {
        const { email, password } = data;
        try {
            const response = await api.post(
                "/api/users/login",
                { email, password },
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            toast.success(
                response.data.message || "User logged in successfully"
            );
            console.log(response.data.data.user);
            localStorage.setItem("user", JSON.stringify(response.data.data));
            console.log(response.data.data.user.avatar, "aghfshf");
            dispatch(
                login({
                    user: response.data.data.user,
                    accessToken: response.data.data.accessToken,
                })
            );

            navigateTo("/");
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.errors || "User login failed");
        }
    };

    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <div className="hero min-h-screen bg-base-200">
                <div className="hero-content flex-col lg:flex-row-reverse">
                    <div className="text-center lg:text-left">
                        <h1 className="text-5xl font-bold">Login now!</h1>
                        <p className="py-6">
                            Connect with friends and explore new connections.
                        </p>
                    </div>
                    <div className="card shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
                        <form
                            className="card-body"
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Email</span>
                                </label>
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className={`input input-bordered ${errors.email ? "input-error" : ""}`}
                                    {...register("email", {
                                        required: "Email is required",
                                    })}
                                />
                                {errors.email && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">
                                            {errors.email.message}
                                        </span>
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
                                    className={`input input-bordered ${errors.password ? "input-error" : ""}`}
                                    {...register("password", {
                                        required: "Password is required",
                                    })}
                                />
                                {errors.password && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">
                                            {errors.password.message}
                                        </span>
                                    </label>
                                )}
                                <label className="label">
                                    <a
                                        href="#"
                                        className="label-text-alt link link-hover"
                                    >
                                        Forgot password?
                                    </a>
                                </label>
                            </div>
                            <div className="form-control mt-6">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >
                                    Login
                                </button>
                            </div>
                            <div className="form-control mt-6">
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={handleGoogleFailure}
                                    render={(renderProps) => (
                                        <button
                                            onClick={renderProps.onClick}
                                            disabled={renderProps.disabled}
                                            className="btn btn-outline btn-primary flex gap-2 items-center justify-center w-full shadow-md hover:bg-blue-500 hover:text-white transition duration-300"
                                        >
                                            <img
                                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png"
                                                alt="Google logo"
                                                className="w-5 h-5"
                                            />
                                            <span>Sign in with Google</span>
                                        </button>
                                    )}
                                />
                            </div>
                        </form>
                        <div className="card-body pt-0">
                            <div className="text-center">
                                <p className="text-sm">
                                    Don't have an account?{" "}
                                    <Link
                                        to="/signup"
                                        className="link link-primary"
                                    >
                                        Sign up
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
};

export default LoginPage;

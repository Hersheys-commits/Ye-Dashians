import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { useDispatch } from "react-redux";
import { login } from "../store/authSlice";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import useGoogleAuth from "../utils/authUtil";

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
            const response = await axios.post(
                "https://nexus-xwdr.onrender.com/api/users/login",
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
                                            className="btn bg-white text-black border-[#e5e5e5]"
                                        >
                                            <svg
                                                aria-label="Google logo"
                                                width="16"
                                                height="16"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 512 512"
                                            >
                                                <g>
                                                    <path
                                                        d="m0 0H512V512H0"
                                                        fill="#fff"
                                                    ></path>
                                                    <path
                                                        fill="#34a853"
                                                        d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"
                                                    ></path>
                                                    <path
                                                        fill="#4285f4"
                                                        d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"
                                                    ></path>
                                                    <path
                                                        fill="#fbbc02"
                                                        d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"
                                                    ></path>
                                                    <path
                                                        fill="#ea4335"
                                                        d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"
                                                    ></path>
                                                </g>
                                            </svg>
                                            Login with Google
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

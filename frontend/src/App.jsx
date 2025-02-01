import { useState } from "react";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import { Toaster } from "react-hot-toast";
import SignupPage from "./pages/SignupPage";
import PageNotFound from "./pages/PageNotFound";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MeetingPage from "./pages/MeetingPage";
import UserProfilePage from "./pages/ProfilePage";
import CurrentUserProfilePage from "./pages/CurProfilePage";
import Chat from "./pages/Chat";

function App() {
    const userInfo = JSON.parse(localStorage.getItem("user"));
    var isLoggedIn = false;
    if (userInfo) isLoggedIn = true;

    return (
        <div>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/message"
                    element={isLoggedIn ? <Chat /> : <Navigate to={"/login"} />}
                />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/meeting" element={<MeetingPage />} />
                <Route
                    path="/profile/:username"
                    element={<UserProfilePage />}
                />
                <Route
                    path="/user/profile"
                    element={<CurrentUserProfilePage />}
                />
                <Route path="*" element={<PageNotFound />} />
            </Routes>
            <Toaster />
        </div>
    );
}

export default App;

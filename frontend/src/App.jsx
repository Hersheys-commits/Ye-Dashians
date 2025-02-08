import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import { Toaster } from "react-hot-toast";

// Import your pages
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import PageNotFound from "./pages/PageNotFound";
import HomePage from "./pages/HomePage";
import MeetingPage from "./pages/MeetingPage";
import UserProfilePage from "./pages/ProfilePage";
import CurrentUserProfilePage from "./pages/CurProfilePage";
import Chat from "./pages/Chat";
import Questionnaire from "./pages/Questionnaire";
import PlaceDetailsPage from "./pages/PlaceDetailsPage";
import SettingsPage from "./pages/SettingsPage";

// Wrapper for protected routes (user must be logged in)
function ProtectedRoute({ children }) {
    const userInfo = JSON.parse(localStorage.getItem("user"));
    const accessToken = Cookies.get("accessToken");

    if (!userInfo || !accessToken) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

// Wrapper for public routes (user must not be logged in)
function PublicRoute({ children }) {
    const userInfo = JSON.parse(localStorage.getItem("user"));
    const accessToken = Cookies.get("accessToken");

    if (userInfo && accessToken) {
        return <Navigate to="/" replace />;
    }
    return children;
}

function App() {
    return (
        <div>
            <Routes>
                {/* Public Routes */}
                <Route
                    path="/login"
                    element={
                        <PublicRoute>
                            <LoginPage />
                        </PublicRoute>
                    }
                />
                <Route
                    path="/signup"
                    element={
                        <PublicRoute>
                            <SignupPage />
                        </PublicRoute>
                    }
                />

                {/* Protected Routes */}
                <Route
                    path="/questionnaire"
                    element={
                        <ProtectedRoute>
                            <Questionnaire />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <HomePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/message"
                    element={
                        <ProtectedRoute>
                            <Chat />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/meeting"
                    element={
                        <ProtectedRoute>
                            <MeetingPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile/:username"
                    element={
                        <ProtectedRoute>
                            <UserProfilePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/place/:place_id"
                    element={
                        <ProtectedRoute>
                            <PlaceDetailsPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/user/profile"
                    element={
                        <ProtectedRoute>
                            <CurrentUserProfilePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="*"
                    element={
                        <ProtectedRoute>
                            <PageNotFound />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute>
                            <SettingsPage />
                        </ProtectedRoute>
                    }
                />
            </Routes>
            <Toaster />
        </div>
    );
}

export default App;

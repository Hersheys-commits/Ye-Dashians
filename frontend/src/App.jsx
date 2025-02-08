import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import axios from "axios";

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
import api from "./utils/axiosRequest";

// Custom hook to check authentication status using axios
function useCheckAuth() {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        async function checkAuth() {
            try {
                const response = await api.get("/api/users/current-user", {
                    withCredentials: true, // ensure cookies are sent with the request
                });

                // If there's no error in the response data, consider the user authenticated.
                if (response.data && !response.data.error) {
                    setAuthenticated(true);
                } else {
                    setAuthenticated(false);
                }
            } catch (error) {
                // In case of any error, assume the user is not authenticated.
                setAuthenticated(false);
            }
            setLoading(false);
        }
        checkAuth();
    }, []);

    return { loading, authenticated };
}

// ProtectedRoute: renders the child element only if the user is authenticated.
// Otherwise, it redirects to the login page.
function ProtectedRoute({ children }) {
    const { loading, authenticated } = useCheckAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!authenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

// PublicRoute: renders the child element only if the user is not authenticated.
// Otherwise, it redirects to the home page.
function PublicRoute({ children }) {
    const { loading, authenticated } = useCheckAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (authenticated) {
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
                    path="/settings"
                    element={
                        <ProtectedRoute>
                            <SettingsPage />
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
            </Routes>
            <Toaster />
        </div>
    );
}

export default App;

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Header from "../components/Header";
import { useSelector } from "react-redux";

function UserProfilePage() {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [friendRequestStatus, setFriendRequestStatus] = useState("not_sent");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));
    const stateuser = useSelector((state) => state.auth.userInfo);
    console.log("stateuser", stateuser);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:4001/api/friends/profile/${username}`,
                    {
                        withCredentials: true,
                        timeout: 5000,
                    }
                );

                if (!response.data.data || !response.data.data.user) {
                    setError("Profile data is not available.");
                    return;
                }

                const userData = response.data.data.user;
                setProfile(userData);
                setFriendRequestStatus(response.data.data.friendRequestStatus);
            } catch (error) {
                console.error("Error fetching profile:", error);
                setError(
                    error.message ||
                        "An error occurred while fetching the profile."
                );
            }
        };

        fetchUserProfile();
    }, [username]);

    const sendFriendRequest = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post(
                `http://localhost:4001/api/friends/friend-request/${username}`,
                {},
                {
                    withCredentials: true,
                }
            );

            if (response.data.success) {
                setFriendRequestStatus("sent");
                toast.success("Friend request sent successfully!");
            }
        } catch (error) {
            console.error("Error sending friend request:", error);
            toast.error(
                error.response?.data?.message ||
                    "Failed to send friend request."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const cancelFriendRequest = async () => {
        setIsLoading(true);
        try {
            const response = await axios.delete(
                `http://localhost:4001/api/friends/cancel-request/${username}`,
                {
                    withCredentials: true,
                }
            );

            if (response.status === 200) {
                setFriendRequestStatus("not_sent");
                toast.success("Friend request cancelled successfully!");
            }
        } catch (error) {
            console.error("Error cancelling friend request:", error);
            toast.error(
                error.response?.data?.message ||
                    "Failed to cancel friend request. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const renderFriendRequestButton = () => {
        if (username === user.user.username) {
            return null;
        }

        switch (friendRequestStatus) {
            case "friends":
                return (
                    <button
                        disabled
                        className="btn btn-success btn-wide cursor-not-allowed"
                    >
                        Friends
                    </button>
                );
            case "not_sent":
                return (
                    <button
                        onClick={sendFriendRequest}
                        disabled={isLoading}
                        className="btn btn-primary btn-wide"
                    >
                        {isLoading ? (
                            <span className="loading loading-spinner"></span>
                        ) : (
                            "Send Friend Request"
                        )}
                    </button>
                );
            case "sent":
                return (
                    <button
                        onClick={cancelFriendRequest}
                        disabled={isLoading}
                        className="btn btn-error btn-wide"
                    >
                        {isLoading ? (
                            <span className="loading loading-spinner"></span>
                        ) : (
                            "Cancel Request"
                        )}
                    </button>
                );
            default:
                return null;
        }
    };

    if (error)
        return (
            <div className="container mx-auto p-4 text-center">
                <div className="alert alert-error">{error}</div>
            </div>
        );

    if (!profile)
        return (
            <div className="container mx-auto p-4 text-center flex justify-center">
                <span className="loading loading-spinner loading-lg "></span>
            </div>
        );

    return (
        <div>
            <Header />
            <div className="container mx-auto p-4">
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body items-center text-center">
                        <div className="avatar mb-4">
                            {profile.avatar ? (
                                <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                    <img
                                        src={profile.avatar}
                                        alt={profile.fullName}
                                    />
                                </div>
                            ) : (
                                <div className="w-24 rounded-full bg-neutral-focus text-neutral-content placeholder">
                                    <span className="text-3xl">
                                        {profile.fullName[0]}
                                    </span>
                                </div>
                            )}
                        </div>

                        <h1 className="card-title text-2xl">
                            {profile.fullName}
                        </h1>
                        <p className="text-gray-500">@{profile.username}</p>
                        <p className="text-gray-500">{profile.email}</p>

                        <div className="card-actions justify-center mt-4">
                            {renderFriendRequestButton()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserProfilePage;

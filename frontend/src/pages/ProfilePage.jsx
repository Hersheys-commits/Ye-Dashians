import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import Header from "../components/Header";
import { BsChatHeartFill } from "react-icons/bs";
import { MdOutlineChat } from "react-icons/md";

function UserProfilePage() {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [friendRequestStatus, setFriendRequestStatus] = useState("not_sent");
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));
    const stateuser = useSelector((state) => state.auth.userInfo);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get(
                    `https://nexus-xwdr.onrender.com/api/friends/profile/${username}`,
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
                `https://nexus-xwdr.onrender.com/api/friends/friend-request/${username}`,
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
                `https://nexus-xwdr.onrender.com/api/friends/cancel-request/${username}`,
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
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );

    return (
        <div>
            <Header />
            <div className="container mx-auto p-4">
                <div className="card bg-base-100 shadow-xl p-6">
                    <div className="flex flex-col md:flex-row items-start">
                        {/* Left Column - Profile Picture */}
                        <div className="mb-4 md:mb-0 md:mr-6 flex-shrink-0">
                            <div className="avatar">
                                <div className="w-64 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                    <img
                                        className="bg-white"
                                        src={
                                            profile.avatar ||
                                            "/api/placeholder/256/256"
                                        }
                                        alt={profile.fullName}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Profile Details */}
                        <div className="flex-grow ml-0 md:ml-10">
                            {/* Basic Info Section */}
                            <div className="mb-6">
                                <h1 className="text-4xl font-bold mb-2">
                                    {profile.fullName}
                                </h1>
                                <p className="text-xl text-gray-500 mb-4">
                                    @{profile.username}
                                </p>

                                {/* Bio Section */}
                                {profile.bio && (
                                    <div className="bg-base-200 p-4 rounded-lg mb-4">
                                        <p className="text-lg">{profile.bio}</p>
                                    </div>
                                )}
                            </div>

                            {/* Personal Details Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {profile.age && (
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">
                                            Age:
                                        </span>
                                        <span>{profile.age}</span>
                                    </div>
                                )}
                                {profile.gender && (
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">
                                            Gender:
                                        </span>
                                        <span className="capitalize">
                                            {profile.gender}
                                        </span>
                                    </div>
                                )}
                                {profile.address && (
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">
                                            Location:
                                        </span>
                                        <span>{profile.address}</span>
                                    </div>
                                )}
                            </div>

                            {/* Preferences Section */}
                            {profile.preferences &&
                                profile.preferences.length > 0 && (
                                    <div className="mb-6">
                                        <h3 className="text-xl font-semibold mb-3">
                                            Interests
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {profile.preferences.map(
                                                (preference, index) => (
                                                    <span
                                                        key={index}
                                                        className="badge badge-primary badge-lg"
                                                    >
                                                        {preference}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-4 mt-6">
                                {renderFriendRequestButton()}
                                {friendRequestStatus === "friends" && (
                                    <button
                                        onClick={() => {
                                            navigate("/message");
                                            dispatch(
                                                setSelectedFriend(profile)
                                            );
                                        }}
                                        className="btn btn-secondary"
                                    >
                                        Chat
                                        <MdOutlineChat className="text-2xl ml-2" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserProfilePage;

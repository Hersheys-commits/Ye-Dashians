import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import toast from 'react-hot-toast';
import Header from "../components/Header";

function CurrentUserProfilePage() {
  const user = useSelector((store) => store.userInfo);
  const [profile, setProfile] = useState({ user });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUserProfile = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4001/api/users/profile",
        {
          withCredentials: true,
        }
      );

      setProfile(response.data.data);
      setIsLoading(false);
    } catch (error) {
      setError("Failed to fetch profile.");
      setIsLoading(false);
      toast.error("Failed to fetch profile.");
    }
  };

  const removeFriend = async (friendId) => {
    try {
      await axios.post(
        `http://localhost:4001/api/friends/remove-friend`,
        { friendId },
        {
          withCredentials: true,
        }
      );

      setProfile((prevProfile) => ({
        ...prevProfile,
        user: {
          ...prevProfile.user,
          friends: prevProfile.user.friends.filter(
            (friend) => friend.userId !== friendId
          ),
        },
      }));
      
      toast.success("Friend removed successfully.");
    } catch (error) {
      toast.error("Failed to remove friend.");
    }
  };

  const acceptFriendRequest = async (requestId) => {
    try {
      await axios.post(
        `http://localhost:4001/api/friends/accept-request`,
        { requestId },
        {
          withCredentials: true,
        }
      );

      fetchCurrentUserProfile();
      toast.success("Friend request accepted.");
    } catch (error) {
      toast.error("Failed to accept friend request.");
    }
  };

  const rejectFriendRequest = async (requestId) => {
    try {
      await axios.post(
        `http://localhost:4001/api/friends/reject-request`,
        { requestId },
        {
          withCredentials: true,
        }
      );

      fetchCurrentUserProfile();
      toast.success("Friend request rejected.");
    } catch (error) {
      toast.error("Failed to reject friend request.");
    }
  };

  useEffect(() => {
    fetchCurrentUserProfile();
  }, []);

  if (isLoading) return <div className="text-center p-4">
    <span className="loading loading-spinner loading-lg"></span>
  </div>;
  
  if (error) return <div className="alert alert-error">{error}</div>;
  
  if (!profile.user) return <div className="alert">No user data available.</div>;

  return (
    <div>
      <Header/>
      <div className="container mx-auto p-4">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl">{profile.user.fullName}</h1>
          <p className="text-gray-500">@{profile.user.username}</p>
          <p className="text-gray-500">{profile.user.email}</p>

          <div className="divider">Friends</div>
          {profile.user.friends && profile.user.friends.length > 0 ? (
            <div className="space-y-2">
              {profile.user.friends.map((friend) => (
                <div key={friend.userId} className="flex justify-between items-center">
                  <span>@{friend.username}</span>
                  <button
                    onClick={() => removeFriend(friend.userId)}
                    className="btn btn-error btn-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No friends yet.</p>
          )}

          <div className="divider">Friend Requests</div>
          {profile.user.friendRequests?.received &&
          profile.user.friendRequests.received.length > 0 ? (
            <div className="space-y-2">
              {profile.user.friendRequests.received.map((request) => (
                <div key={request._id} className="flex justify-between items-center">
                  <span>@{request.requester.username}</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => acceptFriendRequest(request._id)}
                      className="btn btn-success btn-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => rejectFriendRequest(request._id)}
                      className="btn btn-error btn-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No pending friend requests.</p>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}

export default CurrentUserProfilePage;
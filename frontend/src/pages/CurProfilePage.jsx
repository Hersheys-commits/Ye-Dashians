import React, { useState, useEffect } from 'react';
import axios from 'axios';

function CurrentUserProfilePage() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [profile, setProfile] = useState({ 
    user 
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current user profile
  const fetchCurrentUserProfile = async () => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        setError('Authorization token is missing!');
        setIsLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:4001/api/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      setProfile(response.data.data);
      setIsLoading(false);
    } catch (error) {
      setError('Failed to fetch profile.');
      setIsLoading(false);
    }
  };

  // Handle removing a friend
  const removeFriend = async (friendId) => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        setError('Authorization token is missing!');
        return;
      }

      await axios.post(
        `http://localhost:4001/api/friends/remove-friend`,
        { friendId },
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      // Update the friends list by filtering out the removed friend
      setProfile(prevProfile => ({
        ...prevProfile,
        user: {
          ...prevProfile.user,
          friends: prevProfile.user.friends.filter(
            (friend) => friend !== friendId
          )
        }
      }));
    } catch (error) {
      setError('Failed to remove friend.');
    }
  };

  // Handle accepting a friend request
  const acceptFriendRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        setError('Authorization token is missing!');
        return;
      }

      await axios.post(
        `http://localhost:4001/api/friends/accept-request`,
        { requestId },
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      // Refetch profile to get updated friends and friend requests
      fetchCurrentUserProfile();
    } catch (error) {
      setError('Failed to accept friend request.');
    }
  };

  // Handle rejecting a friend request
  const rejectFriendRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        setError('Authorization token is missing!');
        return;
      }

      await axios.post(
        `http://localhost:4001/api/friends/reject-request`,
        { requestId },
        {
          headers: { 'Authorization': `Bearer ${token}` },
        }
      );

      // Refetch profile to get updated friend requests
      fetchCurrentUserProfile();
    } catch (error) {
      setError('Failed to reject friend request.');
    }
  };

  // Fetch profile when component mounts
  useEffect(() => {
    fetchCurrentUserProfile();
  }, []);

  // Render error or loading state
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!profile.user) return <div>No user data available.</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
        {/* User profile section */}
        <h1 className="text-2xl font-bold mb-4">{profile.user.fullName}</h1>
        <p className="text-gray-600 mb-4">@{profile.user.username}</p>
        <p className="text-gray-600 mb-4">{profile.user.email}</p>

        {/* Friends list */}
        <h2 className="text-lg font-bold mt-6">Friends</h2>
        {profile.user.friends && profile.user.friends.length > 0 ? (
          <ul>
            {profile.user.friends.map((friendId) => (
              <li key={friendId} className="flex justify-between mb-2">
                <span>{friendId}</span>
                <button
                  onClick={() => removeFriend(friendId)}
                  className="bg-red-500 text-white px-4 py-1 rounded text-sm"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No friends yet.</p>
        )}

        {/* Friend requests */}
        <h2 className="text-lg font-bold mt-6">Friend Requests</h2>
        {profile.user.friendRequests?.received && profile.user.friendRequests.received.length > 0 ? (
          <ul>
            {profile.user.friendRequests.received.map((request) => (
              <li key={request._id} className="flex justify-between mb-4">
                <span>{request.requester}</span>
                <div>
                  <button
                    onClick={() => acceptFriendRequest(request._id)}
                    className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => rejectFriendRequest(request._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No pending friend requests.</p>
        )}
      </div>
    </div>
  );
}

export default CurrentUserProfilePage;
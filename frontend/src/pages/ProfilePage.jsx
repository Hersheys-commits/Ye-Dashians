import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function UserProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [friendRequestStatus, setFriendRequestStatus] = useState('not_sent');
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('jwt');
        if (!token) {
          setError('Authorization token is missing!');
          return;
        }

        const response = await axios.get(`http://localhost:4001/api/friends/profile/${username}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 5000,
        });

        if (!response.data.data || !response.data.data.user) {
          setError('Profile data is not available.');
          return;
        }

        const userData = response.data.data.user;
        setProfile(userData);

        const requestStatus = response.data.data.friendRequestStatus || 'not_sent';
        setFriendRequestStatus(requestStatus);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError(error.message || 'An error occurred while fetching the profile.');
      }
    };

    fetchUserProfile();
  }, [username]);

  const sendFriendRequest = async () => {
    try {
      const response = await axios.post(
        `http://localhost:4001/api/friends/friend-request/${username}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt')}`,
          },
        }
      );

      if (response.data.message === 'Already friends' || response.data.statusCode === 202) {
        setFriendRequestStatus('accepted');
      } else if (response.data.success) {
        setFriendRequestStatus('sent');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      setError('Failed to send friend request.');
    }
  };

  if (error) return <div>Error: {error}</div>;
  if (!profile) return <div>Loading...</div>;

  const renderFriendRequestButton = () => {
    // Don't show the friend request button if the user is viewing their own profile
    if (username === user.user.username) {
      return null;
    }

    // Check if the user is already in the friends list
    const isFriend = profile.friends && profile.friends.length > 0;

    if (isFriend) {
      return (
        <button
          disabled
          className="bg-green-500 text-white px-4 py-2 rounded cursor-not-allowed"
        >
          Already Friends
        </button>
      );
    }

    switch (friendRequestStatus) {
      case 'not_sent':
        return (
          <button
            onClick={sendFriendRequest}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Send Friend Request
          </button>
        );
      case 'sent':
        return (
          <button
            disabled
            className="bg-yellow-500 text-white px-4 py-2 rounded opacity-50 cursor-not-allowed"
          >
            Request Sent
          </button>
        );
      case 'accepted':
        return (
          <button
            onClick={() => toast.success('Friends already!!!')}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Friends
          </button>
        );
      case 'rejected':
        return (
          <button
            disabled
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Request Rejected
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">{profile.fullName || 'No Name'}</h1>
        <p className="text-gray-600 mb-4">@{profile.username || 'No Username'}</p>

        {renderFriendRequestButton()}
      </div>
    </div>
  );
}

export default UserProfilePage;

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function UserProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [friendRequestStatus, setFriendRequestStatus] = useState('not_sent');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:4001/api/friends/profile/${username}`, {
          withCredentials: true,
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
    setIsLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:4001/api/friends/friend-request/${username}`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response.data.message === 'Already friends' || response.data.statusCode === 202) {
        setFriendRequestStatus('accepted');
        toast.success('Already friends!');
      } else if (response.data.success) {
        setFriendRequestStatus('sent');
        toast.success('Friend request sent successfully!');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error(error.response?.data?.message || 'Failed to send friend request.');
    } finally {
      setIsLoading(false);
    }
  };

  // In your UserProfilePage component, update the cancelFriendRequest function

const cancelFriendRequest = async () => {
  setIsLoading(true);
  try {
      const response = await axios.delete(
          `http://localhost:4001/api/friends/cancel-request/${username}`,
          {
              withCredentials: true
          }
      );

      if (response.status === 200) {
          setFriendRequestStatus('not_sent');
          toast.success('Friend request cancelled successfully!');
      }
  } catch (error) {
      console.error('Error cancelling friend request:', error);
      toast.error(
          error.response?.data?.message || 
          'Failed to cancel friend request. Please try again.'
      );
  } finally {
      setIsLoading(false);
  }
};

  const renderFriendRequestButton = () => {
    if (username === user.user.username) {
      return null;
    }

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
            disabled={isLoading}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition-colors"
          >
            {isLoading ? 'Sending...' : 'Send Friend Request'}
          </button>
        );
      case 'sent':
        return (
          <button
            onClick={cancelFriendRequest}
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
          >
            {isLoading ? 'Cancelling...' : 'Cancel Request'}
          </button>
        );
      case 'accepted':
        return (
          <button
            onClick={() => toast.success('Friends already!')}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Friends
          </button>
        );
      case 'rejected':
        return (
          <button
            disabled
            className="bg-red-500 text-white px-4 py-2 rounded opacity-50 cursor-not-allowed"
          >
            Request Rejected
          </button>
        );
      default:
        return null;
    }
  };

  if (error) return (
    <div className="container mx-auto p-4 text-center text-red-500">
      Error: {error}
    </div>
  );
  
  if (!profile) return (
    <div className="container mx-auto p-4 text-center">
      Loading...
    </div>
  );

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
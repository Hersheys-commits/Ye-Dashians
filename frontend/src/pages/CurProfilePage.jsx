import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import Header from "../components/Header";
import { BsChatHeartFill } from "react-icons/bs";
import { setSelectedFriend } from "../store/chatSlice";
import { useNavigate } from "react-router-dom";
import ProfilePicture from "../components/ProfilePicture";

function CurrentUserProfilePage() {
  const user = useSelector((store) => store.auth.userInfo);
  const [profile, setProfile] = useState({ 
    user: { 
      friends: [], 
      friendRequests: { received: [] } 
    } 
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [friendProfiles, setFriendProfiles] = useState({});
  const [friendRequestProfile,setFriendRequestProfile] = useState({});

  const fetchFriendProfile = async (friendId,str) => {
    try {
      const response = await axios.get(
        `http://localhost:4001/api/friends/getProfileById/${friendId}`,
        {
          withCredentials: true // Added withCredentials option
        }
      );
      console.log(response);
      if(str=="friend"){
        setFriendProfiles(prev => ({
          ...prev,
          [friendId]: response.data.data.user.avatar
        }));
      }else{
        setFriendRequestProfile(prev => ({
          ...prev,
          [friendId]: response.data.data.user.avatar
        }))
      }
    } catch (error) {
      console.error(`Error fetching profile for friend ${friendId}:`, error);
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login"); // Redirect to login if unauthorized
      }
    }
  };

  useEffect(() => {
    if (profile?.user?.friends?.length > 0) {
      profile.user.friends.forEach(friend => {
        fetchFriendProfile(friend.userId,"friend");
      });
    }
  }, [profile.user.friends]);

  useEffect(() => {
    if (profile?.user?.friendRequests?.received?.length > 0) {
      profile.user.friendRequests.received.forEach(friend => {
        fetchFriendProfile(friend.requester.userId,"request");
      });
    }
  }, [profile.user.friendRequests.received]);

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
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login"); // Redirect to login if unauthorized
      } else {
        toast.error("Failed to fetch profile.");
      }
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
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error("Failed to remove friend.");
      }
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
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error("Failed to accept friend request.");
      }
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
      if (error.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        navigate("/login");
      } else {
        toast.error("Failed to reject friend request.");
      }
    }
  };

  useEffect(() => {
    fetchCurrentUserProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center p-4">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (!profile?.user) {
    return <div className="alert">No user data available.</div>;
  }

  return (
    <div>
      <Header />
      <div className="container mx-auto p-4">
        <ProfilePicture/>
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h1 className="card-title text-2xl">
              {profile.user.fullName}
            </h1>
            <p className="text-gray-500">@{profile.user.username}</p>
            <p className="text-gray-500">{profile.user.email}</p>


            {/* Friends  */}
            <div className="divider">Friends</div>
            {profile.user.friends?.length > 0 ? (
              <div className="space-y-4">
                {profile.user.friends.map((friend) => (
                  <div
                    key={friend.userId}
                    className="flex justify-between items-center bg-base-200 p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={friendProfiles[friend.userId] || "/src/assets/Profile_user.png"}
                        alt={friend.username}
                        className="w-12 h-12 rounded-full object-cover bg-white"
                      />
                      <span className="font-medium">@{friend.username}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <BsChatHeartFill
                        onClick={() => {
                          navigate("/message");
                          dispatch(setSelectedFriend(friend));
                        }}
                        className="text-2xl text-pink-500 cursor-pointer hover:scale-110 transition-transform"
                      />
                      <button
                        onClick={() => removeFriend(friend.userId)}
                        className="btn btn-error btn-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">
                No friends yet.
              </p>
            )}



            {/* Friend Requests */}
            <div className="divider">Friend Requests</div>
            {profile.user.friendRequests?.received?.length > 0 ? (
              <div className="space-y-4">
                {profile.user.friendRequests.received.map((request) => (
                  <div
                    key={request._id}
                    className="flex justify-between items-center bg-base-200 p-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={friendRequestProfile[request.requester.userId] || "/src/assets/Profile_user.png"}
                        alt={request.requester.username}
                        className="w-12 h-12 rounded-full object-cover bg-white"
                      />
                      <span className="font-medium">@{request.requester.username}</span>
                    </div>
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
              <p className="text-center text-gray-500">
                No pending friend requests.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CurrentUserProfilePage;
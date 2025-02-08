import React, { useState, useEffect } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import Header from "../components/Header";
import { BsChatHeartFill } from "react-icons/bs";
import { MdOutlineChat } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import { setSelectedFriend } from "../store/chatSlice";
import { useNavigate } from "react-router-dom";
import ProfilePicture from "../components/ProfilePicture";
import Swal from "sweetalert2";
import { useForm, useWatch } from "react-hook-form";

function CurrentUserProfilePage() {
    const user = useSelector((store) => store.auth.userInfo);
    const [profile, setProfile] = useState({
        user: {
            fullName: "",
            bio: "",
            username: "",
            email: "",
            age: 0,
            address: "",
            friends: [],
            friendRequests: { received: [] },
        },
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingBio, setEditingBio] = useState(false);
    const [friendProfiles, setFriendProfiles] = useState({});
    const [friendRequestProfile, setFriendRequestProfile] = useState({});
    const [isPreferencesEditable, setIsPreferencesEditable] = useState(false);
    const [preferences, setPreferences] = useState({});

    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Setup react-hook-form with default values based on the profile
    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            fullName: profile?.user?.fullName || "",
            age: profile?.user?.age || "",
            gender: profile?.user?.gender || "",
            address: profile?.user?.address || "",
        },
    });

    // Form for preferences
    const {
        register: registerPlaces,
        handleSubmit: handleSubmitPlaces,
        control: controlPlaces,
        setValue,
        getValues,
        reset: resetPlaces,
    } = useForm({
        defaultValues: {
            restaurant:
                profile?.user?.preferences?.includes("restaurant") || false,
            cafe: profile?.user?.preferences?.includes("cafe") || false,
            bar: profile?.user?.preferences?.includes("bar") || false,
            park: profile?.user?.preferences?.includes("park") || false,
            theater: profile?.user?.preferences?.includes("theater") || false,
            museum: profile?.user?.preferences?.includes("museum") || false,
            arcade: profile?.user?.preferences?.includes("arcade") || false,
            bakery: profile?.user?.preferences?.includes("bakery") || false,
            library: profile?.user?.preferences?.includes("library") || false,
            mall: profile?.user?.preferences?.includes("mall") || false,
        },
    });

    const placeValues = useWatch({ control: controlPlaces });

    const {
        register: registerBio,
        handleSubmit: handleBioSubmit,
        reset: resetBio,
    } = useForm({
        defaultValues: { bio: profile?.user?.bio || "" },
    });

    const handleBioEdit = () => {
        setEditingBio(true);
        // Reset the form to the current bio value (in case it has changed)
        resetBio({ bio: profile?.user?.bio || "" });
    };

    const onSubmitBio = async (data) => {
        try {
            const response = await axios.post(
                "https://nexus-xwdr.onrender.com/api/users/update-bio",
                data,
                { withCredentials: true }
            );
            // Update the local profile state with the new bio
            setProfile((prevProfile) => ({
                ...prevProfile,
                user: {
                    ...prevProfile.user,
                    bio: data.bio,
                },
            }));
            console.log(response);
            toast.success("Bio updated successfully");
        } catch (error) {
            console.log("first", error.message);
        }
        setEditingBio(false);
    };

    // Called when the edit form is submitted.
    const onSubmit = async (data) => {
        try {
            // Patch request to update user data.
            const response = await axios.patch(
                "https://nexus-xwdr.onrender.com/api/users/update-account",
                data,
                { withCredentials: true }
            );
            // Update the profile with the response data (assuming response.data is the updated user).
            const dataForProfile = { user: response.data.data };
            setProfile(dataForProfile);
            // console.log(response);
            // Exit edit mode.
            setIsEditing(false);
            // Reset the form with the updated data.
            reset({
                fullName: response?.data?.data?.fullName || "",
                age: response?.data?.data?.age || "",
                gender: profile?.user?.gender || "",
                address: response?.data?.data?.address || "",
            });
            toast.success("Profile updated successfully.");
        } catch (error) {
            console.error("Update failed", error);
            toast.error("Update failed. Please try again.");
        }
    };

    // Enter edit mode and reset the form with the current profile values.
    const handleUpdateClick = () => {
        setIsEditing(true);
        reset({
            fullName: profile?.user?.fullName || "",
            age: profile?.user?.age || "",
            gender: profile?.user?.gender || "",
            address: profile?.user?.address || "",
        });
    };

    // Cancel the edit process.
    const cancelUpdate = () => {
        setIsEditing(false);
    };

    // Fetch friend or friend request profile picture based on friendId.
    const fetchFriendProfile = async (friendId, type) => {
        try {
            const response = await axios.get(
                `https://nexus-xwdr.onrender.com/api/friends/getProfileById/${friendId}`,
                { withCredentials: true }
            );
            if (type === "friend") {
                setFriendProfiles((prev) => ({
                    ...prev,
                    [friendId]: response.data.data.user.avatar,
                }));
            } else {
                setFriendRequestProfile((prev) => ({
                    ...prev,
                    [friendId]: response.data.data.user.avatar,
                }));
            }
        } catch (error) {
            console.error(
                `Error fetching profile for friend ${friendId}:`,
                error
            );
            if (error.response?.status === 401) {
                toast.error("Session expired. Please login again.");
                navigate("/login");
            }
        }
    };

    useEffect(() => {
        if (profile?.user?.friends?.length > 0) {
            profile.user.friends.forEach((friend) => {
                fetchFriendProfile(friend.userId, "friend");
            });
        }
    }, [profile?.user?.friends]);

    useEffect(() => {
        const receivedRequests = profile?.user?.friendRequests?.received || [];
        if (receivedRequests.length > 0) {
            receivedRequests.forEach((friend) => {
                fetchFriendProfile(friend.requester.userId, "request");
            });
        }
        // Use JSON.stringify to safely compare arrays in the dependency array.
    }, [profile?.user?.friendRequests?.received]);

    useEffect(() => {
        const resetPreferencesForm = () => {
            resetPlaces({
                restaurant:
                    profile?.user?.preferences?.includes("restaurant") || false,
                cafe: profile?.user?.preferences?.includes("cafe") || false,
                bar: profile?.user?.preferences?.includes("bar") || false,
                park: profile?.user?.preferences?.includes("park") || false,
                theater:
                    profile?.user?.preferences?.includes("theater") || false,
                museum: profile?.user?.preferences?.includes("museum") || false,
                arcade: profile?.user?.preferences?.includes("arcade") || false,
                bakery: profile?.user?.preferences?.includes("bakery") || false,
                library:
                    profile?.user?.preferences?.includes("library") || false,
                mall: profile?.user?.preferences?.includes("mall") || false,
            });
        };
        resetPreferencesForm();
    }, [profile]);

    // Fetch the current user's profile.
    const fetchCurrentUserProfile = async () => {
        try {
            const response = await axios.get(
                "https://nexus-xwdr.onrender.com/api/users/profile",
                { withCredentials: true }
            );
            setProfile(response.data.data);
            // console.log("fetch",response)
            setPreferences(response.data.data.user.preferences);
            setIsLoading(false);
        } catch (error) {
            setError("Failed to fetch profile.");
            setIsLoading(false);
            if (error.response?.status === 401) {
                toast.error("Session expired. Please login again.");
                navigate("/login");
            } else {
                toast.error("Failed to fetch profile.");
            }
        }
    };

    // Remove a friend with a styled confirmation popup
    const removeFriend = async (friendId) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You will remove this friend permanently!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, remove!",
        });

        if (!result.isConfirmed) return; // Exit if cancelled

        try {
            await axios.post(
                `https://nexus-xwdr.onrender.com/api/friends/remove-friend`,
                { friendId },
                { withCredentials: true }
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
            Swal.fire("Removed!", "The friend has been removed.", "success");
        } catch (error) {
            if (error.response?.status === 401) {
                toast.error("Session expired. Please login again.");
                navigate("/login");
            } else {
                toast.error("Failed to remove friend.");
            }
        }
    };

    // Accept a friend request.
    const acceptFriendRequest = async (requestId) => {
        try {
            await axios.post(
                `https://nexus-xwdr.onrender.com/api/friends/accept-request`,
                { requestId },
                { withCredentials: true }
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

    // Reject a friend request.
    const rejectFriendRequest = async (requestId) => {
        try {
            await axios.post(
                `https://nexus-xwdr.onrender.com/api/friends/reject-request`,
                { requestId },
                { withCredentials: true }
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

    // Handle updating place preferences
    const onSubmitPlaces = async (data) => {
        try {
            const response = await axios.post(
                "https://nexus-xwdr.onrender.com/api/users/update-preferences",
                { preferences: data },
                { withCredentials: true }
            );
            console.log(response);
            toast.success("Preferences updated successfully");
            setIsPreferencesEditable(false);
        } catch (error) {
            console.log(error.message);
            toast.error("Failed to update preferences");
        }
    };

    // Toggle "Select All/Unselect All"
    const toggleAllPlaces = () => {
        const current = getValues();
        const shouldSelectAll = Object.values(current).some((val) => !val);
        Object.keys(current).forEach((place) =>
            setValue(place, shouldSelectAll)
        );
    };

    // if (!profile?.user) {
    //   return <div className="alert">No user data available.</div>;
    // }

    return (
        <div>
            <Header />
            <div className="container mx-auto p-4">
                <div className="flex flex-row mx-20 gap-8 p-8 bg-base-200 rounded-2xl shadow-lg">
                    {/* Profile Picture Section */}
                    <div className="flex flex-col items-center gap-4">
                        <ProfilePicture />
                    </div>

                    {/* Bio Section */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                {/* <BsChatHeartFill className="text-secondary" /> */}
                                About Me
                            </h1>
                        </div>

                        {editingBio ? (
                            <form
                                onSubmit={handleBioSubmit(onSubmitBio)}
                                className="space-y-4"
                            >
                                <textarea
                                    {...registerBio("bio")}
                                    className="textarea textarea-bordered w-full h-32 text-lg"
                                    placeholder="Share something about yourself..."
                                    autoFocus
                                />
                                <div className="flex gap-4 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setEditingBio(false)}
                                        className="btn btn-outline btn-error"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                    >
                                        Save Bio
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="group relative">
                                <div className="prose-lg text-gray-300 whitespace-pre-wrap text-md">
                                    {profile?.user?.bio || (
                                        <span className="italic text-gray-400">
                                            No bio added yet...
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={handleBioEdit}
                                    className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity btn btn-ghost btn-circle"
                                >
                                    <FaEdit className="text-2xl text-secondary" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* <div className="divider my-12 before:bg-gray-300 after:bg-gray-300">
                    <span className="text-2xl font-bold text-gray-200 px-4">
                        Profile Details
                    </span>
                </div> */}

                <div className="divider">Profile</div>
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="flex flex-wrap gap-8 justify-center">
                            {/* Profile Section */}
                            <div className="card bg-base-100 shadow-xl p-6 w-96">
                                <div className="flex flex-col items-center">
                                    {!isEditing ? (
                                        <>
                                            <h1 className="card-title text-2xl mb-4">
                                                {profile?.user?.fullName}
                                            </h1>
                                            <div className="w-full grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <div>
                                                        <span className="font-semibold">
                                                            Username:
                                                        </span>
                                                        <p className="text-gray-600">
                                                            @
                                                            {
                                                                profile?.user
                                                                    ?.username
                                                            }
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold">
                                                            Age:
                                                        </span>
                                                        <p className="text-gray-600">
                                                            {profile?.user
                                                                ?.age ||
                                                                "Not specified"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold">
                                                            Gender:
                                                        </span>
                                                        <p className="text-gray-600">
                                                            {profile?.user
                                                                ?.gender ||
                                                                "Not specified"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <div>
                                                        <span className="font-semibold">
                                                            Email:
                                                        </span>
                                                        <p className="text-gray-600 break-all">
                                                            {
                                                                profile?.user
                                                                    ?.email
                                                            }
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold">
                                                            Address:
                                                        </span>
                                                        <p className="text-gray-600">
                                                            {profile?.user
                                                                ?.address ||
                                                                "Not specified"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleUpdateClick}
                                                className="btn btn-primary mt-6 w-full"
                                            >
                                                <FaEdit className="mr-2" />
                                                Edit Profile
                                            </button>
                                        </>
                                    ) : (
                                        <form
                                            onSubmit={handleSubmit(onSubmit)}
                                            className="w-full space-y-4"
                                        >
                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text">
                                                        Full Name
                                                    </span>
                                                </label>
                                                <input
                                                    {...register("fullName")}
                                                    className="input input-bordered"
                                                    placeholder="Enter your full name"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">
                                                            Age
                                                        </span>
                                                    </label>
                                                    <input
                                                        {...register("age")}
                                                        type="number"
                                                        className="input input-bordered"
                                                        placeholder="Enter age"
                                                    />
                                                </div>

                                                <div className="form-control">
                                                    <label className="label">
                                                        <span className="label-text">
                                                            Gender
                                                        </span>
                                                    </label>
                                                    <select
                                                        {...register("gender")}
                                                        className="select select-bordered"
                                                    >
                                                        <option value="">
                                                            Select Gender
                                                        </option>
                                                        <option value="male">
                                                            Male
                                                        </option>
                                                        <option value="female">
                                                            Female
                                                        </option>
                                                        <option value="other">
                                                            Other
                                                        </option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="form-control">
                                                <label className="label">
                                                    <span className="label-text">
                                                        Address
                                                    </span>
                                                </label>
                                                <input
                                                    {...register("address")}
                                                    className="input input-bordered"
                                                    placeholder="Enter your address"
                                                />
                                            </div>

                                            <div className="flex gap-4 mt-6">
                                                <button
                                                    type="submit"
                                                    className="btn btn-success flex-1"
                                                >
                                                    Save Changes
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={cancelUpdate}
                                                    className="btn btn-error flex-1"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>

                            {/* Preferences Section */}
                            <div className="card bg-base-100 shadow-xl p-6 w-96">
                                <h2 className="text-2xl font-bold text-center mb-6">
                                    Place Preferences
                                </h2>
                                {!isPreferencesEditable ? (
                                    <>
                                        <div className="grid grid-cols-3 gap-4">
                                            {Object.keys(placeValues || {}).map(
                                                (place) => (
                                                    <button
                                                        key={place}
                                                        className={`btn ${placeValues[place] ? "btn-primary" : "btn-outline"}`}
                                                        // disabled
                                                    >
                                                        {place
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            place.slice(1)}
                                                    </button>
                                                )
                                            )}
                                        </div>
                                        <button
                                            onClick={() =>
                                                setIsPreferencesEditable(true)
                                            }
                                            className="btn btn-warning btn-sm mt-4 w-full"
                                        >
                                            Update Preferences
                                        </button>
                                    </>
                                ) : (
                                    <form
                                        onSubmit={handleSubmitPlaces(
                                            onSubmitPlaces
                                        )}
                                    >
                                        <div className="grid grid-cols-3 gap-4">
                                            {Object.keys(placeValues || {}).map(
                                                (place) => (
                                                    <button
                                                        type="button"
                                                        key={place}
                                                        className={`btn ${placeValues[place] ? "btn-primary" : "btn-outline"}`}
                                                        onClick={() =>
                                                            setValue(
                                                                place,
                                                                !placeValues[
                                                                    place
                                                                ]
                                                            )
                                                        }
                                                    >
                                                        {place
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            place.slice(1)}
                                                    </button>
                                                )
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-secondary mt-4 w-full"
                                            onClick={toggleAllPlaces}
                                        >
                                            Select/Unselect All
                                        </button>
                                        <div className="card-actions justify-between mt-6">
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                            >
                                                Submit
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-error"
                                                onClick={() =>
                                                    setIsPreferencesEditable(
                                                        false
                                                    )
                                                }
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>

                        {/* Friends Section */}
                        <div className="divider">Friends</div>
                        {profile?.user?.friends?.length > 0 ? (
                            <div className="space-y-4">
                                {profile?.user?.friends.map((friend) => (
                                    <div
                                        key={friend.userId}
                                        className="flex justify-between items-center bg-base-200 p-3 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={
                                                    friendProfiles[
                                                        friend?.userId
                                                    ] ||
                                                    "/src/assets/Profile_user.png"
                                                }
                                                alt={friend?.username}
                                                className="w-12 h-12 rounded-full object-cover bg-white"
                                            />
                                            <span className="font-medium">
                                                @{friend?.username}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <MdOutlineChat
                                                onClick={() => {
                                                    navigate("/message");
                                                    dispatch(
                                                        setSelectedFriend(
                                                            friend
                                                        )
                                                    );
                                                }}
                                                className="text-2xl text-pink-500 cursor-pointer hover:scale-110 transition-transform"
                                            />
                                            <button
                                                onClick={() =>
                                                    removeFriend(friend?.userId)
                                                }
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

                        {/* Friend Requests Section */}
                        <div className="divider">Friend Requests</div>
                        {profile?.user?.friendRequests?.received?.length > 0 ? (
                            <div className="space-y-4">
                                {profile?.user?.friendRequests?.received.map(
                                    (request) => (
                                        <div
                                            key={request._id}
                                            className="flex justify-between items-center bg-base-200 p-3 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={
                                                        friendRequestProfile[
                                                            request?.requester
                                                                ?.userId
                                                        ] ||
                                                        "/src/assets/Profile_user.png"
                                                    }
                                                    alt={
                                                        request?.requester
                                                            ?.username
                                                    }
                                                    className="w-12 h-12 rounded-full object-cover bg-white"
                                                />
                                                <span className="font-medium">
                                                    @
                                                    {
                                                        request?.requester
                                                            ?.username
                                                    }
                                                </span>
                                            </div>
                                            <div className="space-x-2">
                                                <button
                                                    onClick={() =>
                                                        acceptFriendRequest(
                                                            request._id
                                                        )
                                                    }
                                                    className="btn btn-success btn-sm"
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        rejectFriendRequest(
                                                            request._id
                                                        )
                                                    }
                                                    className="btn btn-error btn-sm"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    )
                                )}
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

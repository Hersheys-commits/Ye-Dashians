import React, { useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import defaultProfile from "../assets/Profile_user.png";
import { useEffect } from "react";

function ProfilePicture() {
    const authUser = JSON.parse(localStorage.getItem("user"));
    console.log(authUser);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [selectedImg, setSelectedImg] = useState(null);

    useEffect(() => {
        setSelectedImg(authUser?.user?.avatar || defaultProfile);
    }, [authUser]);

    const handleImageUpload = async (e) => {
        try {
            setIsUpdatingProfile(true);
            const file = e.target.files[0];
            if (!file) return;

            // File size validation (5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File size must be less than 5MB");
                return;
            }

            const formData = new FormData();
            formData.append("avatar", file);

            const response = await axios.patch(
                "https://nexus-xwdr.onrender.com/api/users/avatar",
                formData,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "multipart/form-data",
                        // "Authorization": `Bearer ${authUser.accessToken}` // Add token
                    },
                }
            );

            if (response.data?.data?.avatar) {
                // Update local storage with new user data
                const updatedUser = {
                    ...authUser,
                    user: {
                        ...authUser.user,
                        avatar: response.data.data.avatar,
                    },
                };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setSelectedImg(response.data.data.avatar);
                toast.success("Profile picture updated successfully");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error(
                error.response?.data?.message ||
                    "Failed to update profile picture"
            );
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleRemoveImage = async () => {
        try {
            setIsUpdatingProfile(true);
            const response = await axios.delete(
                "https://nexus-xwdr.onrender.com/api/users/avatar/remove",
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${authUser.accessToken}`,
                    },
                }
            );

            if (response.data?.data) {
                // Update local storage
                const updatedUser = {
                    ...authUser,
                    user: {
                        ...authUser.user,
                        avatar: null,
                    },
                };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setSelectedImg(null);
                toast.success("Profile picture removed successfully");
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                    "Failed to remove profile picture"
            );
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 mr-20">
            <div className="relative">
                {console.log(
                    "Image Source:",
                    selectedImg ||
                        authUser?.user?.avatar ||
                        "/src/assets/Profile_user.png"
                )}
                {console.log(selectedImg)}

                <img
                    key={
                        selectedImg || authUser?.user?.avatar || defaultProfile
                    }
                    src={
                        selectedImg || authUser?.user?.avatar || defaultProfile
                    }
                    alt="Profile"
                    className={`size-32 rounded-full object-cover border-4 ${
                        !selectedImg && !authUser?.user?.avatar
                            ? "bg-white"
                            : ""
                    }`}
                />
                <label
                    htmlFor="avatar-upload"
                    className={`
                    absolute bottom-0 right-0 
                    bg-base-content hover:scale-105
                    p-2 rounded-full cursor-pointer 
                    transition-all duration-200
                    ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                    `}
                >
                    <Camera className="w-5 h-5 text-base-200" />
                    <input
                        type="file"
                        id="avatar-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUpdatingProfile}
                    />
                </label>
                {/* Delete button - only show if there's a selected or uploaded image */}
                {authUser.user.avatar && (
                    <button
                        onClick={handleRemoveImage}
                        disabled={isUpdatingProfile}
                        className={`
                        absolute bottom-0 left-0
                        bg-red-500 hover:bg-red-600 hover:scale-105
                        p-2 rounded-full cursor-pointer
                        transition-all duration-200
                        ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                        `}
                    >
                        <Trash2 className="w-5 h-5 text-white" />
                    </button>
                )}
            </div>
            <p className="text-sm text-zinc-400">
                {isUpdatingProfile ? "Processing..." : ""}
            </p>
        </div>
    );
}

export default ProfilePicture;

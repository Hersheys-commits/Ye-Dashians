import { useState } from "react";
import { Camera, Trash2 } from "lucide-react";
import axios from "axios";
import defaultImage from "../assets/Profile_user.png";

const ProfilePicture = () => {
    const [authUser, setAuthUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user")) || null;
        } catch {
            return null;
        }
    });
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // File size validation (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert("File size must be less than 5MB");
            return;
        }

        setIsUpdatingProfile(true);

        try {
            const formData = new FormData();
            formData.append("avatar", file);

            const { data: response } = await axios.patch(
                "http://localhost:4001/api/users/avatar",
                formData,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (response?.data?.avatar) {
                const updatedUser = {
                    ...authUser,
                    user: {
                        ...authUser.user,
                        avatar: response.data.avatar,
                    },
                };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setAuthUser(updatedUser);
                setImageError(false);
            }
        } catch (error) {
            console.error("Upload failed:", error);
            alert(
                error.response?.data?.message ||
                    "Failed to update profile picture"
            );
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleRemoveImage = async () => {
        if (!authUser?.accessToken) return;

        setIsUpdatingProfile(true);

        try {
            await axios.delete(
                "http://localhost:4001/api/users/avatar/remove",
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${authUser.accessToken}`,
                    },
                }
            );

            const updatedUser = {
                ...authUser,
                user: {
                    ...authUser.user,
                    avatar: null,
                },
            };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setAuthUser(updatedUser);
        } catch (error) {
            console.error("Remove failed:", error);
            alert(
                error.response?.data?.message ||
                    "Failed to remove profile picture"
            );
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleImageError = () => {
        setImageError(true);
    };

    const getImageSource = () => {
        if (imageError) return defaultImage;
        if (!authUser?.user?.avatar) return defaultImage;
        return authUser.user.avatar;
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative w-32 h-32">
                <img
                    src={getImageSource()}
                    alt="Profile"
                    onError={handleImageError}
                    className="w-full h-full rounded-full object-cover border-4 border-gray-200 "
                />

                <label
                    htmlFor="avatar-upload"
                    className={`absolute bottom-0 right-0 bg-gray-800 hover:bg-gray-700 p-2 rounded-full cursor-pointer transition-all duration-200 ${
                        isUpdatingProfile
                            ? "opacity-50 pointer-events-none"
                            : ""
                    }`}
                >
                    <Camera className="w-5 h-5 text-white" />
                    <input
                        type="file"
                        id="avatar-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUpdatingProfile}
                    />
                </label>

                {authUser?.user?.avatar && !imageError && (
                    <button
                        onClick={handleRemoveImage}
                        disabled={isUpdatingProfile}
                        className={`absolute bottom-0 left-0 bg-red-500 hover:bg-red-600 p-2 rounded-full cursor-pointer transition-all duration-200 ${
                            isUpdatingProfile
                                ? "opacity-50 pointer-events-none"
                                : ""
                        }`}
                    >
                        <Trash2 className="w-5 h-5 text-white" />
                    </button>
                )}
            </div>

            {isUpdatingProfile && (
                <p className="text-sm text-gray-500">Processing...</p>
            )}
        </div>
    );
};

export default ProfilePicture;

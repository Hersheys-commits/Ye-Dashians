import React from "react";
import { useDispatch } from "react-redux";
import { setSelectedFriend } from "../../../store/chatSlice";
import { useSocket } from "../../../hooks/socketHook";
import defaultAvatar from "../../../assets/Profile_user.png";
import { FaImage } from "react-icons/fa6";

const User = ({ user, header = false }) => {
    const dispatch = useDispatch();
    const { selectedFriend, onlineUsers } = useSocket();
    const isSelected = selectedFriend?._id === user?._id;
    const isOnline = onlineUsers.includes(user?._id);

    const handleUserClick = () => {
        if (!header) {
            dispatch(setSelectedFriend(user));
        }
    };

    return (
        <div
            className={`flex py-2 pr-2 ${!header ? "hover:bg-base-300 duration-300 cursor-pointer" : ""} ${
                isSelected && !header ? "bg-base-200" : ""
            }`}
            onClick={handleUserClick}
        >
            <div
                className={`avatar ${isOnline ? "avatar-online" : "avatar-offline"} w-10 h-10 mx-2`}
            >
                <div className="w-10 rounded-full bg-base-100">
                    <img
                        src={user?.avatar ? user.avatar : defaultAvatar}
                        alt={user?.fullName || "User Avatar"}
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
            <div className="flex flex-col text-sm pl-1">
                <div className="font-bold text-base-content">
                    {user?.fullName || "User"}
                </div>
                {!header && (
                    <div className="text-base-content/70">{user?.email}</div>
                )}
                {header && isOnline && (
                    <div className="text-green-500">Online</div>
                )}
                {header && !isOnline && (
                    <div className="text-red-500">Offline</div>
                )}
            </div>
        </div>
    );
};

export default User;

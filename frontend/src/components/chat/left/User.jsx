import React, { useState } from "react";
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
            className={`flex py-2 pr-2 ${!header ? "hover:bg-slate-600 duration-300 cursor-pointer" : ""} ${isSelected && !header ? "bg-slate-800" : ""}`}
            onClick={handleUserClick}
        >
            <div
                className={`avatar ${isOnline ? "avatar-online" : "avatar-offline"} w-10 h-10 mx-2`}
            >
                <div className="w-24 rounded-full bg-white">
                    <img
                        src={user?.avatar ? user.avatar : defaultAvatar}
                        alt={user?.fullName || "User Avatar"}
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
            <div className="flex flex-col text-sm pl-1">
                <div className="font-bold">
                    {user?.fullName || "Harsh Sharma"}
                </div>
                {!header && <div>{user?.email}</div>}
                {/* {!header && user?.lastMessage!='' && user?.lastImage=='' && <div>{user.lastMessage}</div>} */}
                {/* {!header && user?.lastMessage=='' && user?.lastImage!='' && <div className="flex flex-row"><FaImage/> IMG</div>}
                {!header && user?.lastMessage!='' && user?.lastImage!='' && <div className="flex flex-row"><FaImage/> {user.lastMessage}</div>} */}

                {header && isOnline && <div>Online</div>}
                {header && !isOnline && <div>Offline</div>}
            </div>
        </div>
    );
};

export default User;

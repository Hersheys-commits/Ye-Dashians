// User.jsx
import React, { memo } from "react";
import { useDispatch } from "react-redux";
import { setSelectedFriend } from "../../../store/chatSlice";
import { useSocket } from '../../../hooks/socketHook';

const User = memo(({ user }) => {
    const dispatch = useDispatch();
    const { selectedFriend, onlineUsers } = useSocket();
    const isSelected = selectedFriend?._id === user?._id;
    const isOnline = onlineUsers.includes(user?._id);

    const handleUserClick = () => {
        dispatch(setSelectedFriend(user));
    };

    return (
        <div
            className={`flex py-2 pr-2 hover:bg-slate-600 duration-300 cursor-pointer ${isSelected ? "bg-slate-800" : ""}`}
            onClick={handleUserClick}
        >
            <div className={`avatar ${isOnline ? "avatar-online" : "avatar-offline"} w-10 h-10 mx-2`}>
                <div className="w-24 rounded-full">
                    <img 
                        src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" 
                        alt={user?.fullName} 
                    />
                </div>
            </div>
            <div className="flex flex-col text-sm pl-1">
                <div className="font-bold">
                    {user?.fullName || "Harsh Sharma"}
                </div>
                <div>{user?.email || "harshsharma@gmail.com"}</div>
            </div>
        </div>
    );
});

export default User;
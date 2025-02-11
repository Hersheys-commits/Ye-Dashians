import React from "react";
import User from "../left/User";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function ChatHeader() {
    const selectedFriend = useSelector((state) => state.chat.selectedFriend);

    return (
        <div className="flex justify-center bg-base-300">
            <User user={selectedFriend} header={true} />
        </div>
    );
}

export default ChatHeader;

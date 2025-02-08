import React from "react";
import ChatHeader from "./ChatHeader";
import Messages from "./Messages";
import Sendtext from "./Sendtext";
import { useSelector } from "react-redux";
import NoChatSelected from "./NoChatSelected";

function ChatArea() {
    const selectedFriend = useSelector((state) => state.chat.selectedFriend);

    if (!selectedFriend) {
        return (
            <div className="w-[70%] h-full bg-base-200">
                <NoChatSelected />
            </div>
        );
    }

    return (
        <div className="w-[70%] h-full bg-base-100">
            <div>
                <ChatHeader />
            </div>
            <div
                className="flex-1 overflow-y-auto"
                style={{ minHeight: "calc(75vh)", maxHeight: "calc(75vh)" }}
            >
                <Messages />
            </div>
            <div>
                <Sendtext />
            </div>
        </div>
    );
}

export default ChatArea;

import React from "react";
import ChatHeader from "./ChatHeader";
import Messages from "./Messages";
import Sendtext from "./Sendtext";

function ChatArea() {
    return (
        <div className="w-[70%] h-full bg-slate-800">
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

import React from "react";
import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-base-200">
            <div className="text-center p-8 rounded-lg bg-base-100 shadow-lg">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-base-content/50" />
                <h2 className="text-2xl font-semibold text-base-content mb-2">
                    No Chat Selected
                </h2>
                <p className="text-base-content/70 mb-4 max-w-sm">
                    Select a chat from your contacts list to start messaging or
                    continue a conversation.
                </p>
            </div>
        </div>
    );
};

export default NoChatSelected;

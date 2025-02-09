import React from "react";
import { useSelector } from "react-redux";
import { formatMessageTime } from "../../../utils/time";
import { useNavigate } from "react-router-dom";

function Message({ message }) {
    const selectedFriend = useSelector((store) => store.chat.selectedFriend);
    // Assume the current user is the sender if message.senderId does NOT match the selected friend's id.
    const userIsSender = message.senderId !== selectedFriend._id;
    const time = formatMessageTime(message.createdAt);
    const navigateTo = useNavigate();

    // Render the message content (supports text and image)
    // If both image and text exist, image is rendered above the text.
    const renderContent = () => {
        return (
            <>
                {message.image && (
                    <img
                        src={message.image}
                        alt="Message"
                        className="rounded-lg w-full max-h-[300px] object-contain mb-2"
                    />
                )}
                {message.text && (
                    <p className="text-sm">
                        {message.isTemplate ? (
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: message.text,
                                }}
                            />
                        ) : (
                            message.text
                        )}
                    </p>
                )}
            </>
        );
    };

    return (
        <div className="px-3 pt-3">
            {/* Message Bubble */}
            <div
                className={`flex ${userIsSender ? "justify-end" : "justify-start"}`}
            >
                <div
                    className={`
            max-w-[80%] rounded-xl p-3 shadow-sm
            ${userIsSender ? "bg-primary text-primary-content" : "bg-base-200 text-base-content"}
          `}
                >
                    {renderContent()}
                    <p
                        className={`
              text-[10px] mt-1.5
              ${userIsSender ? "text-primary-content/70" : "text-base-content/70"}
            `}
                    >
                        {time}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Message;

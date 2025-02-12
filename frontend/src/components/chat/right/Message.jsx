import React from "react";
import { useSelector } from "react-redux";
import { formatMessageTime } from "../../../utils/time";
import { useNavigate } from "react-router-dom";

function Message({ message }) {
    const selectedFriend = useSelector((store) => store.chat.selectedFriend);
    const userIsSender = message.senderId !== selectedFriend._id;
    const time = formatMessageTime(message.createdAt);
    const navigateTo = useNavigate();

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
                    <div
                        className={`text-sm break-words ${message.isTemplate ? "w-full overflow-x-hidden" : ""}`}
                    >
                        {message.isTemplate ? (
                            <div
                                className="w-full max-w-full overflow-hidden"
                                dangerouslySetInnerHTML={{
                                    __html: message.text,
                                }}
                            />
                        ) : (
                            message.text
                        )}
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="px-3 pt-3 w-full">
            <div
                className={`flex ${userIsSender ? "justify-end" : "justify-start"}`}
            >
                <div
                    className={`
                        w-full sm:max-w-[80%] rounded-xl p-3 shadow-sm
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

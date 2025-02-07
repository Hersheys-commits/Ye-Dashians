import React from "react";
import { useSelector } from "react-redux";
import { formatMessageTime } from "../../../utils/time";
import defaultAvatar from "../../../assets/Profile_user.png";
import { useNavigate } from "react-router-dom";

function Message({ message }) {
    const selectedFriend = useSelector((store) => store.chat.selectedFriend);
    const userIsSender = message.senderId !== selectedFriend._id;
    const time = formatMessageTime(message.createdAt);
    const user = JSON.parse(localStorage.getItem("user"));
    const navigateTo = useNavigate();

    // Helper to render text: if isTemplate is true, render HTML.
    const renderMessageText = (text) => {
        if (message.isTemplate) {
            return (
                <div
                    className="inline-block max-w-[500px] break-words"
                    dangerouslySetInnerHTML={{ __html: text }}
                />
            );
        }
        return (
            <div className="inline-block max-w-[500px] break-words">{text}</div>
        );
    };

    return (
        <div>
            <div
                className={`chat ${userIsSender ? "chat-end" : "chat-start"} px-3 pt-3`}
            >
                <div
                    className={`chat-bubble ${
                        userIsSender
                            ? "chat-bubble-neutral"
                            : "chat-bubble-info"
                    } ${!message.text || message.isTemplate ? "p-1" : ""}`}
                >
                    {/* Image only */}
                    {message.image && !message.text && (
                        <img
                            src={message.image}
                            alt="Message"
                            className="rounded-lg max-w-[200px] max-h-[300px] object-contain"
                        />
                    )}

                    {/* Text only */}
                    {message.text &&
                        !message.image &&
                        renderMessageText(message.text)}

                    {/* Both image and text */}
                    {message.image && message.text && (
                        <div className="flex flex-col -mx-3 -mt-1 max-w-[200px]">
                            <img
                                src={message.image}
                                alt="Message"
                                className="rounded-lg w-full max-h-[300px] object-contain"
                            />
                            <span className="-mb-1 break-words">
                                {message.isTemplate ? (
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: message.text,
                                        }}
                                    />
                                ) : (
                                    message.text
                                )}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            <div
                className={`mx-5 ${userIsSender ? "flex flex-row-reverse" : ""}`}
            >
                <p className="text-sm text-slate-400">{time}</p>
            </div>
        </div>
    );
}

export default Message;

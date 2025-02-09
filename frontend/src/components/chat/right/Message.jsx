import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { formatMessageTime } from "../../../utils/time";
import { useNavigate } from "react-router-dom";

function Message({ message }) {
    const selectedFriend = useSelector((store) => store.chat.selectedFriend);
    const userIsSender = message.senderId !== selectedFriend._id;
    const time = formatMessageTime(message.createdAt);
    const navigate = useNavigate();
    const messageRef = useRef(null);

    useEffect(() => {
        if (message.isTemplate && messageRef.current) {
            // Add click handlers to all place links in the message
            const placeLinks =
                messageRef.current.querySelectorAll(".place-link");
            placeLinks.forEach((link) => {
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    const placeId = e.target.dataset.placeId;
                    if (placeId) {
                        navigate(`/place/${placeId}`);
                    }
                });
            });
        }
    }, [message.isTemplate, navigate]);

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
                        ref={messageRef}
                        className="text-sm"
                        dangerouslySetInnerHTML={{
                            __html: message.isTemplate
                                ? message.text
                                : message.text,
                        }}
                    />
                )}
            </>
        );
    };

    return (
        <div className="px-3 pt-3">
            <div
                className={`flex ${userIsSender ? "justify-end" : "justify-start"}`}
            >
                <div
                    className={`max-w-[80%] rounded-xl p-3 shadow-sm ${
                        userIsSender
                            ? "bg-primary text-primary-content"
                            : "bg-base-200 text-base-content"
                    }`}
                >
                    {renderContent()}
                    <p
                        className={`text-[10px] mt-1.5 ${
                            userIsSender
                                ? "text-primary-content/70"
                                : "text-base-content/70"
                        }`}
                    >
                        {time}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Message;

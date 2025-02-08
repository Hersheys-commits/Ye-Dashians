import React, { useEffect, useRef } from "react";
import Message from "./Message";
import useGetMessage from "../../../hooks/useGetMessage";
import Loading from "../../Loading";
import { useSelector } from "react-redux";
import useGetSocketMessage from "../../../hooks/useGetSocketMessage";

function Messages() {
    const messages = useSelector((state) => state.chat.messages) || [];
    const { messageLoading } = useGetMessage();
    const selectedFriend = useSelector((store) => store.chat.selectedFriend);
    const lastMessageRef = useRef(null);
    useGetSocketMessage();

    useEffect(() => {
        setTimeout(() => {
            if (lastMessageRef.current) {
                lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
            }
        }, 0);
    }, [messages]);

    if (!selectedFriend) {
        return (
            <div className="flex items-center justify-center h-full bg-base-200">
                <p className="text-center text-lg text-base-content">
                    Welcome! Select a chat to start messaging.
                </p>
            </div>
        );
    }

    if (messageLoading) {
        return (
            <div className="flex justify-center items-center mt-10">
                <Loading tail="flex justify-center items-center" />
            </div>
        );
    }

    return (
        <div
            className="flex-1 overflow-y-auto bg-base-100"
            style={{ minHeight: "calc(84vh - 8vh)" }}
        >
            {!messageLoading && messages.length === 0 && (
                <div className="text-center mt-10 text-base-content">
                    Say! Hi to start conversation
                </div>
            )}

            {messages.map((message) => (
                <div key={message._id} ref={lastMessageRef}>
                    <Message message={message} />
                </div>
            ))}
        </div>
    );
}

export default Messages;

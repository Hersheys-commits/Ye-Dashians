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

    // Move useEffect after all hooks are defined
    useEffect(() => {
        setTimeout(()=>{
            if (lastMessageRef.current) {
                lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
            }
        },0);
    }, [messages]);

    if (!selectedFriend) {
        return (
            <div>
                <p className="text-center mt-[20%]">Welcome!!!!!</p>
            </div>
        );
    }

    if (messageLoading) {
        return (
            <div>
                <Loading tail="flex justify-center items-center mt-10" />
            </div>
        );
    }

    return (
        <div
            className="flex-1 overflow-y-auto"
            style={{ minHeight: "calc(84vh - 8vh)" }}
        >
            {!messageLoading && messages.length === 0 && (
                <div className="text-center mt-[20%]">
                    Say! Hi to start conversation
                </div>
            )}

            {messages.map((message, index) => (
                <div key={message._id} ref={lastMessageRef}>
                    <Message message={message} />
                </div>
            ))}
        </div>
    );
}

export default Messages;
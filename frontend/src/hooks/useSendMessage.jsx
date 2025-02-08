import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMessages } from "../store/chatSlice";
import axios from "axios";

function useSendMessage() {
    const [sendMessageLoading, setSendMessageLoading] = useState(false);
    const selectedFriend = useSelector((store) => store.chat.selectedFriend);
    const messages = useSelector((store) => store.chat.messages) || [];
    const dispatch = useDispatch();

    const sendMessage = async (messageData) => {
        setSendMessageLoading(true);
        try {
            const formData = new FormData();
            if (messageData.text) {
                formData.append("text", messageData.text);
            }
            if (messageData.image) {
                formData.append("image", messageData.image);
            }
            if (messageData.isTemplate) {
                formData.append("isTemplate", messageData.isTemplate);
            }
            console.log("selectedFriend", selectedFriend);
            const res = await axios.post(
                `https://nexus-xwdr.onrender.com/api/message/sendMessage/${selectedFriend._id}`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            console.log(res);
            dispatch(setMessages([...messages, res.data.data]));
            setSendMessageLoading(false);
        } catch (error) {
            console.log("Error in sending messages:", error);
            setSendMessageLoading(false);
        }
    };

    return { sendMessageLoading, sendMessage };
}

export default useSendMessage;

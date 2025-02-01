import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setMessages } from '../store/chatSlice';
import axios from 'axios';

function useSendMessage() {
    const [sendMessageLoading, setSendMessageLoading] = useState(false);
    const selectedFriend = useSelector((store) => store.chat.selectedFriend);
    const messages = useSelector((store) => store.chat.messages) || []; // Add default empty array
    const dispatch = useDispatch();
    
    const sendMessage = async (message) => {
        setSendMessageLoading(true);
        try {
            const res = await axios.post(
                `http://localhost:4001/api/message/sendMessage/${selectedFriend._id}`,
                {
                    text: message
                },
                {
                    withCredentials: true,
                }
            );
            
            // Handle both cases: when messages is null/undefined or when it's an array
            const currentMessages = Array.isArray(messages) ? messages : [];
            dispatch(setMessages([...currentMessages, res.data.data]));
            
            setSendMessageLoading(false);
        } catch (error) {
            console.log("Error in sending messages:", error);
            setSendMessageLoading(false);
        }
    };

    return { sendMessageLoading, sendMessage }
}

export default useSendMessage
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setMessages } from '../store/chatSlice';

function useGetMessage() {
    const [messageLoading, setMessageLoading] = useState(false);
    const selectedFriend = useSelector((store) => store.chat.selectedFriend);
    // const auth = useSelector((store) => store.auth); // Get auth state to access token
    const dispatch = useDispatch();
    const [messages, setLocalMessages] = useState([]); // Changed to state variable

    useEffect(() => {
        const getMessages = async () => {
            setMessageLoading(true);
            if (selectedFriend?._id) {
                try {
                    const res = await axios.get(
                        `http://localhost:4001/api/message/getMessage/${selectedFriend._id}`,
                        {
                          withCredentials:true,
                        }
                    );
                    dispatch(setMessages(res.data.data)); // Assuming ApiResponse structure
                    setLocalMessages(res.data.data);
                    setMessageLoading(false);
                } catch (error) {
                    console.log("Error in fetching messages:", error);
                    setMessageLoading(false);
                }
            }
        };
        getMessages();
    }, [selectedFriend, dispatch]);

    return { messageLoading, messages };
}

export default useGetMessage
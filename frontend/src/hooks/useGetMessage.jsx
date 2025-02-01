import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMessages } from "../store/chatSlice";

function useGetMessage() {
    const [messageLoading, setMessageLoading] = useState(false);
    const selectedFriend = useSelector((store) => store.chat.selectedFriend);
    const dispatch = useDispatch();

    useEffect(() => {
        const getMessages = async () => {
            setMessageLoading(true);
            if (selectedFriend?._id) {
                try {
                    const res = await axios.get(
                        `http://localhost:4001/api/message/getMessage/${selectedFriend._id}`,
                        {
                            withCredentials: true,
                        }
                    );
                    dispatch(setMessages(res.data.data));
                    setMessageLoading(false);
                } catch (error) {
                    console.log("Error in fetching messages:", error);
                    setMessageLoading(false);
                }
            }
        };
        getMessages();
    }, [selectedFriend, dispatch]);

    return { messageLoading };
}

export default useGetMessage;
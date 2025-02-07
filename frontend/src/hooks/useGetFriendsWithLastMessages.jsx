import axios from "axios";
import { useEffect, useState } from "react";
import useGetAllFriends from "./useGetAllFriends";
import { useDispatch } from "react-redux";
import { updateFriendLastMessage } from "../store/friendSlice";

function useGetFriendsWithLastMessages() {
    const [allFriends, friendLoading] = useGetAllFriends();
    const [friendsWithMessages, setFriendsWithMessages] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(false);

    useEffect(() => {
        const fetchLastMessages = async () => {
            const dispatch = useDispatch();

            if (friendLoading || allFriends.length === 0) return;

            setMessagesLoading(true);
            try {
                const lastMessagesPromises = allFriends.map(async (friend) => {
                    try {
                        const response = await axios.get(
                            `http://localhost:4001/api/message/getLastMessage/${friend._id}`,
                            { withCredentials: true }
                        );
                        const res = {
                            ...friend,
                            lastMessage: response.data.data?.text || "",
                            lastImage: response.data.data?.image || "",
                            lastMessageTime: response.data.data?.createdAt
                                ? new Date(response.data.data.createdAt)
                                : undefined,
                        };
                        dispatch(updateFriendLastMessage(res));
                        return res;
                    } catch (error) {
                        console.log(
                            `Error fetching last message for friend ${friend.id}:`,
                            error
                        );
                        return {
                            ...friend,
                            lastMessage: "",
                            lastMessageTime: undefined,
                        };
                    }
                });

                const friendsWithLastMessages =
                    await Promise.all(lastMessagesPromises);

                const sortedFriends = friendsWithLastMessages.sort(
                    (a, b) =>
                        (b.lastMessageTime?.getTime() || 0) -
                        (a.lastMessageTime?.getTime() || 0)
                );

                setFriendsWithMessages(sortedFriends);
                setMessagesLoading(false);
            } catch (error) {
                console.log("Error in useGetFriendsWithLastMessages:", error);
                setMessagesLoading(false);
            }
        };

        fetchLastMessages();
    }, [allFriends, friendLoading]);

    return [friendsWithMessages, messagesLoading, setFriendsWithMessages];
}

export default useGetFriendsWithLastMessages;

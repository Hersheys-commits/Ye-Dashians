// socketHook.js
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    initializeSocket,
    closeSocket,
    getSocket,
} from "../store/socketMiddleware";

export const useSocket = () => {
    const dispatch = useDispatch();
    const connected = useSelector((state) => state.socket.connected);
    const onlineUsers = useSelector((state) => state.socket.onlineUsers);
    const selectedFriend = useSelector((state) => state.chat.selectedFriend);

    useEffect(() => {
        const authUser = JSON.parse(localStorage.getItem("user"));

        if (authUser && !getSocket()) {
            dispatch(initializeSocket(authUser.user._id));

            return () => {
                dispatch(closeSocket());
            };
        }
    }, [dispatch]);

    return {
        socket: getSocket(),
        connected,
        onlineUsers,
        selectedFriend,
    };
};

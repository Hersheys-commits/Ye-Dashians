import io from "socket.io-client";
import {
    setConnectionStatus,
    setOnlineUsers,
    clearSocketState,
} from "./socketSlice";
import { addMessage } from "./chatSlice";
import { updateFriendLastMessage } from "./friendSlice"; // adjust the path as needed

let socket = null; // Keep socket instance outside of Redux

export const initializeSocket = (userId) => (dispatch, getState) => {
    if (socket) return; // Prevent multiple socket connections

    socket = io("http://localhost:4001", {
        query: { userId: userId },
    });

    socket.on("connection", () => {
        dispatch(
            setConnectionStatus({
                connected: true,
                socketId: socket.id,
            })
        );
    });

    socket.on("getOnlineUsers", (users) => {
        dispatch(setOnlineUsers(users));
    });

    socket.on("newMessage", (newMessage) => {
        // Get the currently selected friend from state
        const { selectedFriend } = getState().chat;

        /*  
          Check if the newMessage belongs to the currently active chat.
          For example, if the logged in user (user2) has selected a friend (user3)
          then only dispatch messages that involve user3.
          We assume newMessage has senderId and receiverId fields.
        */
        if (
            selectedFriend &&
            (selectedFriend._id === newMessage.senderId ||
                selectedFriend._id === newMessage.receiverId)
        ) {
            dispatch(addMessage(newMessage));
        }

        //Here create a new code so that it appends changes in redux when it gets newMessage

        // Notify the sender that the message was received (or perform other actions)
        socket.emit("messageReceived", { messageId: newMessage._id });
    });

    socket.on("disconnect", () => {
        dispatch(
            setConnectionStatus({
                connected: false,
                socketId: null,
            })
        );
    });

    return socket; // Return for cleanup purposes
};

export const closeSocket = () => (dispatch) => {
    if (socket) {
        socket.close();
        socket = null;
        dispatch(clearSocketState());
    }
};

// Export for components that need to access socket
export const getSocket = () => socket;

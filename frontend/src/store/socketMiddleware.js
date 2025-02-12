// client/store/socketMiddleware.js
import io from "socket.io-client";
import {
    setConnectionStatus,
    setOnlineUsers,
    clearSocketState,
} from "./socketSlice";
import { addMessage } from "./chatSlice";

let socket = null;

export const initializeSocket = (userId) => (dispatch) => {
    if (socket?.connected) {
        console.log("Socket already connected");
        return;
    }

    const SOCKET_URL =
        import.meta.env.VITE_BACKEND_URL || "https://nexus-xwdr.onrender.com";
    console.log("Initializing socket connection to:", SOCKET_URL);

    socket = io(SOCKET_URL, {
        query: { userId },
        transports: ["websocket", "polling"],
        withCredentials: true,
        timeout: 10000,
    });

    socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
        dispatch(
            setConnectionStatus({
                connected: true,
                socketId: socket.id,
            })
        );
    });

    socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        dispatch(
            setConnectionStatus({
                connected: false,
                socketId: null,
            })
        );
    });

    socket.on("getOnlineUsers", (users) => {
        console.log("Online users updated:", users);
        dispatch(setOnlineUsers(users));
    });

    socket.on("newMessage", (newMessage) => {
        console.log("New message received:", newMessage);
        dispatch(addMessage(newMessage));
    });

    socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        dispatch(
            setConnectionStatus({
                connected: false,
                socketId: null,
            })
        );
    });

    // Add error handling
    socket.on("error", (error) => {
        console.error("Socket error:", error);
    });

    return socket;
};

export const closeSocket = () => (dispatch) => {
    if (socket?.connected) {
        console.log("Closing socket connection");
        socket.close();
        socket = null;
        dispatch(clearSocketState());
    }
};

export const getSocket = () => socket;

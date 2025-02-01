// socketMiddleware.js
import io from 'socket.io-client';
import { setConnectionStatus, setOnlineUsers, clearSocketState } from './socketSlice';
import { addMessage } from './chatSlice';

let socket = null; // Keep socket instance outside of Redux

export const initializeSocket = (userId) => (dispatch) => {
  if (socket) return; // Prevent multiple socket connections

  socket = io("http://localhost:4001", {
    query: {
      userId: userId,
    },
  });

  socket.on("connection", () => {
    dispatch(setConnectionStatus({ 
      connected: true, 
      socketId: socket.id 
    }));
  });

  socket.on("getOnlineUsers", (users) => {
    dispatch(setOnlineUsers(users));
  });

  socket.on("newMessage", (newMessage) => {
    dispatch(addMessage(newMessage));
    socket.emit("messageReceived", { messageId: newMessage._id });
  });

  socket.on("disconnect", () => {
    dispatch(setConnectionStatus({ 
      connected: false, 
      socketId: null 
    }));
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
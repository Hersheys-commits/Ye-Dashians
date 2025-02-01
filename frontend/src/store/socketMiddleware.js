// socketMiddleware.js
import io from 'socket.io-client';
import { setConnectionStatus, setOnlineUsers, clearSocketState } from './socketSlice';
import { addMessage } from './chatSlice';

let socket = null; // Keep socket instance outside of Redux

<<<<<<< HEAD
export const initializeSocket = (userId) => (dispatch, getState) => {
  if (socket) return; // Prevent multiple socket connections

  socket = io("http://localhost:4001", {
    query: { userId: userId },
=======
export const initializeSocket = (userId) => (dispatch) => {
  if (socket) return; // Prevent multiple socket connections

  socket = io("http://localhost:4001", {
    query: {
      userId: userId,
    },
>>>>>>> 261f566fc3cb19e69f31df7b0f15d4b5131ef71f
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
<<<<<<< HEAD
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
    
    // Notify the sender that the message was received (or perform other actions)
=======
    dispatch(addMessage(newMessage));
>>>>>>> 261f566fc3cb19e69f31df7b0f15d4b5131ef71f
    socket.emit("messageReceived", { messageId: newMessage._id });
  });

  socket.on("disconnect", () => {
    dispatch(setConnectionStatus({ 
      connected: false, 
      socketId: null 
    }));
  });

<<<<<<< HEAD
=======

>>>>>>> 261f566fc3cb19e69f31df7b0f15d4b5131ef71f
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
<<<<<<< HEAD
export const getSocket = () => socket;
=======
export const getSocket = () => socket;
>>>>>>> 261f566fc3cb19e69f31df7b0f15d4b5131ef71f

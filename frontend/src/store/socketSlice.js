// socketSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  connected: false,
  onlineUsers: [],
  socketId: null
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setConnectionStatus: (state, action) => {
      state.connected = action.payload.connected;
      state.socketId = action.payload.socketId;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    clearSocketState: (state) => {
      state.connected = false;
      state.onlineUsers = [];
      state.socketId = null;
    }
  }
});

export const { setConnectionStatus, setOnlineUsers, clearSocketState } = socketSlice.actions;
export default socketSlice.reducer;
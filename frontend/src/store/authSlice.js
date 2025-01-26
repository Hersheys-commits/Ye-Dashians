import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: false,
  userInfo: null, // Stores user information when logged in
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state, action) {
      state.isLoggedIn = true;
      state.userInfo = action.payload; // Payload contains user info
    },
    logout(state) {
      state.isLoggedIn = false;
      state.userInfo = null;
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;

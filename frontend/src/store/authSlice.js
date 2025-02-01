import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isLoggedIn: false,
    userInfo: null, // Stores user information when logged in
    token: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login(state, action) {
            state.isLoggedIn = true;
            console.log("payload", action.payload);
            state.userInfo = action.payload.user; // Payload contains user info
            state.token = action.payload.accessToken;
        },
        logout(state) {
            state.isLoggedIn = false;
            state.userInfo = null;
            state.token = null;
        },
    },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;

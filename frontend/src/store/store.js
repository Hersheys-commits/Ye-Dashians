// store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import chatReducer from "./chatSlice";
import socketReducer from "./socketSlice";
import friendReducer from "./friendSlice";

const store = configureStore({
    reducer: {
        auth: authReducer,
        chat: chatReducer,
        socket: socketReducer,
        friend: friendReducer,
    },
});

export default store;

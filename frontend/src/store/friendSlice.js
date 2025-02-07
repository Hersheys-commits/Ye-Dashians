// friendsSlice.js
import { createSlice } from "@reduxjs/toolkit";

const friendsSlice = createSlice({
    name: "friends",
    initialState: {
        list: [],
        refreshNeeded: false,
    },
    reducers: {
        setFriends(state, action) {
            state.list = action.payload;
        },
        updateFriendLastMessage(state, action) {
            const { friendId, message } = action.payload;
            const friendIndex = state.list.findIndex(
                (friend) => friend._id === friendId
            );
            if (friendIndex !== -1) {
                state.list[friendIndex] = {
                    ...state.list[friendIndex],
                    lastMessage: message.text || "",
                    lastImage: message.image || "",
                    lastMessageTime: new Date(message.createdAt),
                };
            }
        },
        // Optionally, you can add a flag to trigger a refresh if needed.
        setRefreshNeeded(state, action) {
            state.refreshNeeded = action.payload;
        },
    },
});

export const { setFriends, updateFriendLastMessage, setRefreshNeeded } =
    friendsSlice.actions;
export default friendsSlice.reducer;

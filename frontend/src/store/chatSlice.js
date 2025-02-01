import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedFriend: null,
    messages: [],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSelectedFriend(state, action) {
      state.selectedFriend = action.payload;
    },
    setMessages(state,action){
        state.messages= action.payload;
    }
  },
});

export const { setSelectedFriend,setMessages } = chatSlice.actions;

export default chatSlice.reducer;

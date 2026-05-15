import { createSlice } from '@reduxjs/toolkit';
const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        items: [],
        unreadCount: 0,
    },
    reducers: {
        addNotification: (state, action) => {
            // The error happens here if state.items is undefined
            if (!state.items) {
                state.items = [];
            }
            state.items.unshift(action.payload); // Now it won't crash
            state.unreadCount += 1;
        },
        markAllAsRead: (state) => {
            state.unreadCount = 0;
        },
    }
})

export const { addNotification, markAllAsRead } = notificationSlice.actions
export default notificationSlice.reducer
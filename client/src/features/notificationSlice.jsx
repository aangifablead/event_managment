import { createSlice } from '@reduxjs/toolkit';
const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        items: [],
        unreadCount: 0,
    },
    reducers: {
        addNotification: (state, action) => {
            state.item.unshift({
                ...action.payload,
                id: Date.now(),
                isRead: false
            })
            state.unreadCount += 1
        },
        markAllAsRead: (state) => {
            state.items = state.items.map(item => ({ ...item, isRead: true }));
            state.unreadCount = 0
        },
        clearNotifications: (state) => {
            state.item = [];
            state.unreadCount = 0
        }
    }
})

export const { clearNotifications, addNotification, markAllAsRead } = notificationSlice.actions
export default notificationSlice.reducer
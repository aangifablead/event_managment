import { createSlice } from '@reduxjs/toolkit';
const bookingSlice = createSlice({
    name: 'bookings',
    initialState: {
        item: [],
        filter: ''
    },
    reducers: {
        setBookings: (state, action) => {
            state.item = action.payload
        },
        setFilter: (state, action) => {
            state.filter = action.payload
        },
        updateStatusInStore: (state, action) => {
            const { id, status } = action.payload
            const index = state.item.findIndex(item => item.id === id)
            if (index !== -1) {
                state.item[index].status = status
            }
        },
        removeBookingFromStore: (state, action) => {
            state.item = state.item.filter(item => item.id !== action.payload)
        }
    }
})

export const { setBookings, setFilter, updateStatusInStore, removeBookingFromStore } = bookingSlice.actions;
export default bookingSlice.reducer;
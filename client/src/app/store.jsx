import { configureStore } from '@reduxjs/toolkit';
import uiReducer from '../features/toggle';
import authReducer from '../features/authSlice'
import bookingReducer from '../features/bookingSlice'
import userReducer from '../features/userSlice'
import eventsReducer from '../features/eventSlice'
import notificationReducer from '../features/notificationSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,//for login page
    ui: uiReducer,//for toggle navbar and sidebar
    users: userReducer,//for user crud and store
    bookings: bookingReducer,//for booking page
    events: eventsReducer,
    notifications: notificationReducer
  },
});
import { configureStore } from '@reduxjs/toolkit';
import uiReducer from '../features/toggle';
import authReducer from '../features/authSlice'

export const store = configureStore({
  reducer: {
    // We map the uiSlice to the 'ui' key in our state
    auth: authReducer,
    ui: uiReducer,
    // future slices go here:
    // bookings: bookingReducer,
    // events: eventReducer,
  },
});
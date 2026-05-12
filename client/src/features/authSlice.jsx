import { createSlice } from '@reduxjs/toolkit';

const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('token');

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isAuthenticated: !!storedToken,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
    },
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.clear(); // Clears everything including user data
    },
  },
});

export const { loginUser, logoutUser } = authSlice.actions;
export default authSlice.reducer;
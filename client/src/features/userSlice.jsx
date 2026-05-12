import { createSlice } from '@reduxjs/toolkit';

// Helper to get current user ID safely
const getUserId = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? user._id || user.id : 'guest';
};

const userSlice = createSlice({
  name: 'users',
  initialState: {
    items: [], 
    filter: '',
  },
  reducers: {
    // Call this on App load or after Login
    loadUserSpecificData: (state) => {
      const userId = getUserId();
      const savedData = localStorage.getItem(`users_data_${userId}`);
      state.items = savedData ? JSON.parse(savedData) : [];
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    addUserToStore: (state, action) => {
      state.items.unshift(action.payload);
      // Persist to user-specific key
      localStorage.setItem(`users_data_${getUserId()}`, JSON.stringify(state.items));
    },
    updateUserInStore: (state, action) => {
      const index = state.items.findIndex(user => user._id === action.payload._id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
        localStorage.setItem(`users_data_${getUserId()}`, JSON.stringify(state.items));
      }
    },
    removeUserFromStore: (state, action) => {
      state.items = state.items.filter(u => u._id !== action.payload);
      localStorage.setItem(`users_data_${getUserId()}`, JSON.stringify(state.items));
    }
  }
});

export const { 
    loadUserSpecificData, 
    setFilter, 
    addUserToStore, 
    updateUserInStore, 
    removeUserFromStore 
} = userSlice.actions;

export default userSlice.reducer;
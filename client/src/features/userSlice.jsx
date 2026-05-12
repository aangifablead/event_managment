import { createSlice } from '@reduxjs/toolkit';

const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? (user._id || user.id) : 'guest';
  } catch {
    return 'guest';
  }
};

const userSlice = createSlice({
  name: 'users',
  initialState: {
    items: [],
    filter: '',
  },
  reducers: {
    setUsers: (state, action) => {
      state.items = action.payload;
      localStorage.setItem(`users_data_${getUserId()}`, JSON.stringify(state.items));
    },
    loadUserSpecificData: (state) => {
      const savedData = localStorage.getItem(`users_data_${getUserId()}`);
      if (savedData) {
        state.items = JSON.parse(savedData);
      }
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    addUserToStore: (state, action) => {
      state.items.unshift(action.payload);
      localStorage.setItem(`users_data_${getUserId()}`, JSON.stringify(state.items));
    },
    updateUserInStore: (state, action) => {
      const id = action.payload._id || action.payload.id || action.payload.mongoId;
      const index = state.items.findIndex(user => (user._id || user.id || user.mongoId) === id);
      if (index !== -1) {
        state.items[index] = action.payload;
        localStorage.setItem(`users_data_${getUserId()}`, JSON.stringify(state.items));
      }
    },
    removeUserFromStore: (state, action) => {
      state.items = state.items.filter(u => (u._id !== action.payload && u.mongoId !== action.payload && u.id !== action.payload));
      localStorage.setItem(`users_data_${getUserId()}`, JSON.stringify(state.items));
    }
  }
});

export const { loadUserSpecificData, setFilter, setUsers, addUserToStore, updateUserInStore, removeUserFromStore } = userSlice.actions;
export default userSlice.reducer;
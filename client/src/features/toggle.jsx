import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isSidebarOpen: false,
  activePage: 'Dashboard',
  user: { 
    name: 'Orlando Lauric', 
    role: 'Admin', 
    avatar: 'https://i.pravatar.cc/150?u=orlando' 
  }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    closeSidebar: (state) => {
      state.isSidebarOpen = false;
    },
    setPage: (state, action) => {
      state.activePage = action.payload;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    }
  }
});

export const { toggleSidebar, closeSidebar, setPage, updateUser } = uiSlice.actions;
export default uiSlice.reducer;
import { createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = {
  // Renamed 'items' to 'events' to match the selector in your Page component
  events: [], 
  filters: { search: '', category: 'All Categories' },
  pagination: { currentPage: 1, itemsPerPage: 8 }
};

const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    // 1. SET ALL: Used when fetching from the server
    setEvents: (state, action) => {
      state.events = action.payload;
    },
    
    // 2. ADD ONE: Specifically for the handleSuccess instant update
    addEvent: (state, action) => {
      // We unshift (add to start) because we want newest first
      // We don't need to reformat if the API already sends the correct object
      state.events.unshift(action.payload);
    },

    // 3. DELETE: Support both 'id' and '_id' from MongoDB
    deleteEvent: (state, action) => {
      state.events = state.events.filter(event => 
        (event.id || event._id) !== action.payload
      );
    },

    // 4. UPDATE: Find by ID and merge new data
    updateEvent: (state, action) => {
      const id = action.payload.id || action.payload._id;
      const index = state.events.findIndex(event => (event.id || event._id) === id);
      if (index !== -1) {
        state.events[index] = { ...state.events[index], ...action.payload };
      }
    },

    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1; // Reset to page 1 on filter change
    },

    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    }
  }
});

// SELECTORS
const selectRawEvents = state => state.events.events;
const selectFilters = state => state.events.filters;

export const selectFilteredEvents = createSelector(
  [selectRawEvents, selectFilters],
  (events, filters) => {
    if (!events) return [];
    
    return events.filter(event => {
      // Use the 'name' field from your API
      const eventName = event.name || "";
      const matchesSearch = eventName.toLowerCase().includes(filters.search.toLowerCase());
      const matchesCat = filters.category === 'All Categories' || event.category === filters.category;
      
      return matchesSearch && matchesCat;
    });
  }
);

export const { 
    setEvents, 
    addEvent, 
    setFilters, 
    setCurrentPage, 
    deleteEvent, 
    updateEvent 
} = eventSlice.actions;

export default eventSlice.reducer;
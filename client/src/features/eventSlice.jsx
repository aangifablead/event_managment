import { createSlice, createSelector } from '@reduxjs/toolkit';

// Helper to load data from localStorage (Keep as fallback)
const loadEvents = () => {
  try {
    const saved = localStorage.getItem('persisted_events');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Adventure Gear Show', price: 40, category: 'Fashion', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b', progress: 65, date: "June 5, 2026 — 8:00 PM" },
      { id: 2, name: 'Symphony Under Stars', price: 50, category: 'Music', image: 'https://images.unsplash.com/photo-1514525253361-bee04856a782', progress: 65, date: "June 5, 2026 — 8:00 PM" },
    ];
  } catch (err) {
    return [];
  }
};

const initialState = {
  items: loadEvents(),
  filters: { search: '', category: 'All Categories' },
  pagination: { currentPage: 1, itemsPerPage: 8 }
};

const eventSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    // ADD THIS REDUCER: To set events from API
    setEvents: (state, action) => {
      state.items = action.payload;
      // Optional: keep localStorage in sync
      localStorage.setItem('persisted_events', JSON.stringify(state.items));
    },
    
    addEvent: (state, action) => {
      // If action.payload already comes formatted from API, just push it
      const eventToAdd = action.payload.id ? action.payload : {
        id: Date.now(),
        name: action.payload.title,
        price: parseFloat(String(action.payload.price).replace(/[$,]/g, '')),
        category: action.payload.category,
        image: action.payload.coverImage ? (typeof action.payload.coverImage === 'string' ? action.payload.coverImage : URL.createObjectURL(action.payload.coverImage)) : '/api/placeholder/400/320',
        location: `${action.payload.location}, ${action.payload.city}`,
        progress: 0,
        date: `${action.payload.date} — ${action.payload.time}`,
      };

      state.items.unshift(eventToAdd);
      localStorage.setItem('persisted_events', JSON.stringify(state.items));
    },

    deleteEvent: (state, action) => {
      state.items = state.items.filter(event => (event.id || event._id) !== action.payload);
      localStorage.setItem('persisted_events', JSON.stringify(state.items));
    },

    updateEvent: (state, action) => {
      const id = action.payload.id || action.payload._id;
      const index = state.items.findIndex(event => (event.id || event._id) === id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
        localStorage.setItem('persisted_events', JSON.stringify(state.items));
      }
    },

    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1;
    },

    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    }
  }
});

const selectAllItems = state => state.events.items;
const selectFilters = state => state.events.filters;

export const selectFilteredEvents = createSelector(
  [selectAllItems, selectFilters],
  (items, filters) => {
    return items.filter(event => {
      // Handle both API 'name' and local 'title' variations
      const name = event.name || event.title || "";
      const matchesSearch = name.toLowerCase().includes(filters.search.toLowerCase());
      const matchesCat = filters.category === 'All Categories' || event.category === filters.category;
      return matchesSearch && matchesCat;
    });
  }
);

// Added setEvents to the exports
export const { 
    setEvents, 
    addEvent, 
    setFilters, 
    setCurrentPage, 
    deleteEvent, 
    updateEvent 
} = eventSlice.actions;

export default eventSlice.reducer;
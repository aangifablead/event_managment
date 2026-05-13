import { createSlice, createSelector } from '@reduxjs/toolkit';

// Helper to load data from localStorage
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
    addEvent: (state, action) => {
      const { title, price, category, coverImage, date, time, location, city } = action.payload;

      const newEvent = {
        id: Date.now(),
        name: title,
        price: parseFloat(String(price).replace(/[$,]/g, '')),
        category: category,
        image: coverImage ? URL.createObjectURL(coverImage) : '/api/placeholder/400/320',
        location: `${location}, ${city}`, // Combine for the UI display
        progress: 0,
        date: `${date} — ${time}`,
      };

      state.items.unshift(newEvent);
      localStorage.setItem('persisted_events', JSON.stringify(state.items));
    },
    // New: Remove an event by ID
    deleteEvent: (state, action) => {
      state.items = state.items.filter(event => event.id !== action.payload);
      localStorage.setItem('persisted_events', JSON.stringify(state.items));
    },
    // New: Update existing event details
    updateEvent: (state, action) => {
      const index = state.items.findIndex(event => event.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload.updates };
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
      const matchesSearch = event.name.toLowerCase().includes(filters.search.toLowerCase());
      const matchesCat = filters.category === 'All Categories' || event.category === filters.category;
      return matchesSearch && matchesCat;
    });
  }
);

export const { addEvent, setFilters, setCurrentPage ,deleteEvent,updateEvent} = eventSlice.actions;
export default eventSlice.reducer;
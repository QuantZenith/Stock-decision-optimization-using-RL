import { configureStore } from '@reduxjs/toolkit';
import chartReducer from './chartSlice';
import signalsReducer from './signalsSlice';
import authReducer from './authSlice';

// Middleware to persist state to localStorage
const persistMiddleware = (store) => (next) => (action) => {
  const result = next(action);
  const state = store.getState();
  
  // Save to localStorage after every action
  try {
    // Do not persist auth state or token to localStorage
    localStorage.setItem('reduxState', JSON.stringify({
      chart: state.chart,
      signals: state.signals,
    }));
  } catch (e) {
    console.warn('Failed to save state to localStorage:', e);
  }
  
  return result;
};

// Load persisted state from localStorage
const loadPersistedState = () => {
  try {
    const saved = localStorage.getItem('reduxState');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure no auth state is loaded from localStorage
      if (parsed.auth) {
        delete parsed.auth;
      }
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to load state from localStorage:', e);
  }
  return undefined;
};

// Create preloaded state from localStorage
const preloadedState = loadPersistedState();

const store = configureStore({
  preloadedState,
  reducer: {
    chart: chartReducer,
    signals: signalsReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(persistMiddleware),
});

export default store;

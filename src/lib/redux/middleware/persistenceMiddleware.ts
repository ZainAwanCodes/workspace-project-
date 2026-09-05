import { Middleware } from '@reduxjs/toolkit';

const STATE_KEY = 'workspace_manager_state';

/**
 * Loads the initial state from localStorage.
 * Used during store initialization to rehydrate the app state.
 */
export const loadState = () => {
  try {
    if (typeof window === 'undefined') return undefined; // Support SSR/SSG safety
    
    const serializedState = localStorage.getItem(STATE_KEY);
    if (serializedState === null) {
      return undefined; // Let reducers initialize with default mock data
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading state from localStorage:', err);
    return undefined;
  }
};

/**
 * Clears the persisted state from localStorage and reloads the app.
 * Useful for "Reset to Defaults" functionality.
 */
export const clearState = () => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STATE_KEY);
      window.location.reload();
    }
  } catch (err) {
    console.error('Error clearing state:', err);
  }
};

let timeoutId: ReturnType<typeof setTimeout>;

/**
 * Redux middleware that saves the store state to localStorage.
 * Writes are debounced to prevent performance degradation during rapid interactions (e.g., drag and drop).
 */
export const persistenceMiddleware: Middleware = store => next => action => {
  const result = next(action);

  // Debounce the save operation (1000ms delay)
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    try {
      const state = store.getState();
      const serializedState = JSON.stringify(state);
      localStorage.setItem(STATE_KEY, serializedState);
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
  }, 1000);

  return result;
};

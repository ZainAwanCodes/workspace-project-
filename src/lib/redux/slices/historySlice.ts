import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '@/types/task';

export interface HistoryEntry {
  id: string;
  description: string;
  timestamp: string;
  // Snapshot of affected tasks before and after the action
  previousTasks: Task[];
  nextTasks: Task[];
}

interface HistoryState {
  past: HistoryEntry[];
  future: HistoryEntry[];
  maxHistory: number;
}

const initialState: HistoryState = {
  past: [],
  future: [],
  maxHistory: 30,
};

export const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    recordHistory: (state, action: PayloadAction<Omit<HistoryEntry, 'id' | 'timestamp'>>) => {
      const entry: HistoryEntry = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        ...action.payload,
      };

      state.past.push(entry);
      if (state.past.length > state.maxHistory) {
        state.past.shift();
      }
      // Clear redo stack on any new mutation
      state.future = [];
    },
    popUndo: (state) => {
      const entry = state.past.pop();
      if (entry) {
        state.future.push(entry);
      }
    },
    popRedo: (state) => {
      const entry = state.future.pop();
      if (entry) {
        state.past.push(entry);
      }
    },
    clearHistory: (state) => {
      state.past = [];
      state.future = [];
    },
  },
});

export const { recordHistory, popUndo, popRedo, clearHistory } = historySlice.actions;
export default historySlice.reducer;

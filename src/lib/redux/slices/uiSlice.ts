import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  globalSearchQuery: string;
  activeViewMode: 'kanban' | 'list' | 'calendar';
  groupBy: 'assignee' | 'status' | 'priority' | 'label' | 'none';
  activeFilters: {
    assigneeIds: string[];
    labels: string[];
    priorities: string[];
    statuses: string[];
  };
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
}

const initialState: UIState = {
  globalSearchQuery: '',
  activeViewMode: 'kanban',
  groupBy: 'none',
  activeFilters: {
    assigneeIds: [],
    labels: [],
    priorities: [],
    statuses: [],
  },
  theme: 'light',
  sidebarOpen: true,
  commandPaletteOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setGlobalSearchQuery: (state, action: PayloadAction<string>) => {
      state.globalSearchQuery = action.payload;
    },
    setActiveViewMode: (state, action: PayloadAction<UIState['activeViewMode']>) => {
      state.activeViewMode = action.payload;
    },
    setGroupBy: (state, action: PayloadAction<UIState['groupBy']>) => {
      state.groupBy = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<UIState['activeFilters']>>) => {
      state.activeFilters = { ...state.activeFilters, ...action.payload };
    },
    clearFilters: (state) => {
      state.activeFilters = initialState.activeFilters;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    setCommandPaletteOpen: (state, action: PayloadAction<boolean>) => {
      state.commandPaletteOpen = action.payload;
    }
  }
});

export const {
  setGlobalSearchQuery, setActiveViewMode, setGroupBy,
  setFilters, clearFilters, toggleTheme,
  setSidebarOpen, setCommandPaletteOpen
} = uiSlice.actions;

export default uiSlice.reducer;

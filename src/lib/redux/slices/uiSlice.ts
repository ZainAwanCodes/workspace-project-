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
  selectedTaskIds: string[];
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
  selectedTaskIds: [],
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
    },
    toggleTaskSelection: (state, action: PayloadAction<string>) => {
      const index = state.selectedTaskIds.indexOf(action.payload);
      if (index >= 0) {
        state.selectedTaskIds.splice(index, 1);
      } else {
        state.selectedTaskIds.push(action.payload);
      }
    },
    selectAllTasks: (state, action: PayloadAction<string[]>) => {
      state.selectedTaskIds = Array.from(new Set([...state.selectedTaskIds, ...action.payload]));
    },
    deselectTasks: (state, action: PayloadAction<string[]>) => {
      state.selectedTaskIds = state.selectedTaskIds.filter(id => !action.payload.includes(id));
    },
    clearTaskSelection: (state) => {
      state.selectedTaskIds = [];
    }
  }
});

export const {
  setGlobalSearchQuery, setActiveViewMode, setGroupBy,
  setFilters, clearFilters, toggleTheme,
  setSidebarOpen, setCommandPaletteOpen,
  toggleTaskSelection, selectAllTasks, deselectTasks, clearTaskSelection
} = uiSlice.actions;

export default uiSlice.reducer;

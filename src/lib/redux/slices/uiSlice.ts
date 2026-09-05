import { createSlice, PayloadAction, nanoid } from '@reduxjs/toolkit';

export interface FilterState {
  assigneeIds: string[];
  labels: string[];
  priorities: string[];
  statuses: string[];
}

export interface FilterPreset {
  id: string;
  name: string;
  icon?: string;
  isSystem?: boolean;
  filters: FilterState;
}

export const DEFAULT_FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'preset-high-urgent',
    name: 'High & Urgent',
    icon: 'Flame',
    isSystem: true,
    filters: {
      assigneeIds: [],
      labels: [],
      priorities: ['high', 'urgent'],
      statuses: [],
    },
  },
  {
    id: 'preset-active',
    name: 'Active (In Progress & Review)',
    icon: 'Clock',
    isSystem: true,
    filters: {
      assigneeIds: [],
      labels: [],
      priorities: [],
      statuses: ['in-progress', 'review'],
    },
  },
  {
    id: 'preset-backlog',
    name: 'To Do / Backlog',
    icon: 'ListTodo',
    isSystem: true,
    filters: {
      assigneeIds: [],
      labels: [],
      priorities: [],
      statuses: ['todo'],
    },
  },
  {
    id: 'preset-done',
    name: 'Completed Tasks',
    icon: 'CheckCircle2',
    isSystem: true,
    filters: {
      assigneeIds: [],
      labels: [],
      priorities: [],
      statuses: ['done'],
    },
  },
];

interface UIState {
  globalSearchQuery: string;
  activeViewMode: 'kanban' | 'list' | 'calendar';
  groupBy: 'assignee' | 'status' | 'priority' | 'label' | 'none';
  activeFilters: FilterState;
  filterPresets: FilterPreset[];
  activePresetId: string | null;
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  shortcutsModalOpen: boolean;
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
  filterPresets: DEFAULT_FILTER_PRESETS,
  activePresetId: null,
  theme: (() => {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem('wm-theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  })() as 'light' | 'dark',
  sidebarOpen: true,
  commandPaletteOpen: false,
  shortcutsModalOpen: false,
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
    setFilters: (state, action: PayloadAction<Partial<FilterState>>) => {
      state.activeFilters = { ...state.activeFilters, ...action.payload };
      state.activePresetId = null; // custom filter applied
    },
    clearFilters: (state) => {
      state.activeFilters = {
        assigneeIds: [],
        labels: [],
        priorities: [],
        statuses: [],
      };
      state.activePresetId = null;
    },
    applyFilterPreset: (state, action: PayloadAction<{ presetId: string; filters: FilterState }>) => {
      state.activeFilters = action.payload.filters;
      state.activePresetId = action.payload.presetId;
    },
    saveFilterPreset: (state, action: PayloadAction<{ name: string; filters: FilterState }>) => {
      const newPreset: FilterPreset = {
        id: `custom-${nanoid(6)}`,
        name: action.payload.name,
        isSystem: false,
        filters: action.payload.filters,
      };
      state.filterPresets.push(newPreset);
      state.activePresetId = newPreset.id;
    },
    deleteFilterPreset: (state, action: PayloadAction<string>) => {
      state.filterPresets = state.filterPresets.filter(p => p.id !== action.payload || p.isSystem);
      if (state.activePresetId === action.payload) {
        state.activePresetId = null;
      }
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
    setShortcutsModalOpen: (state, action: PayloadAction<boolean>) => {
      state.shortcutsModalOpen = action.payload;
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
  setFilters, clearFilters, applyFilterPreset, saveFilterPreset, deleteFilterPreset,
  toggleTheme, setSidebarOpen, setCommandPaletteOpen, setShortcutsModalOpen,
  toggleTaskSelection, selectAllTasks, deselectTasks, clearTaskSelection
} = uiSlice.actions;

export default uiSlice.reducer;


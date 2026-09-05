import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import workspaceReducer from './slices/workspaceSlice';
import projectReducer from './slices/projectSlice';
import taskReducer from './slices/taskSlice';
import uiReducer from './slices/uiSlice';
import notificationReducer from './slices/notificationSlice';
import activityReducer from './slices/activitySlice';
import historyReducer from './slices/historySlice';
import { loadState, persistenceMiddleware } from './middleware/persistenceMiddleware';

const rootReducer = combineReducers({
  auth: authReducer,
  workspaces: workspaceReducer,
  projects: projectReducer,
  tasks: taskReducer,
  ui: uiReducer,
  notifications: notificationReducer,
  activities: activityReducer,
  history: historyReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: loadState() as Partial<ReturnType<typeof rootReducer>>,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(persistenceMiddleware),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export type AppStore = typeof store;

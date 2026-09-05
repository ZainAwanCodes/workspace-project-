import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import { Notification, NotificationPreferences } from '@/types/notification';

export const notificationsAdapter = createEntityAdapter<Notification>();

const initialNotifications: Notification[] = [
  {
    id: 'n1',
    userId: 'u1',
    type: 'assigned',
    message: 'You were assigned to "Design Homepage Mockups"',
    isRead: false,
    taskId: 't1',
    createdAt: new Date().toISOString()
  }
];

const initialState = notificationsAdapter.getInitialState({
  preferences: {
    assigned: true,
    mentioned: true,
    due_soon: true,
    activity_ticker_alerts: true,
    email_digest: false,
    sound_enabled: true,
  } as NotificationPreferences
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: notificationsAdapter.setAll(initialState, initialNotifications),
  reducers: {
    addNotification: notificationsAdapter.addOne,
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.entities[action.payload];
      if (notification) {
        notification.isRead = true;
      }
    },
    markAllAsRead: (state) => {
      state.ids.forEach(id => {
        const notif = state.entities[id];
        if (notif) {
          notif.isRead = true;
        }
      });
    },
    updatePreferences: (state, action: PayloadAction<Partial<NotificationPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    }
  }
});

export const { addNotification, markAsRead, markAllAsRead, updatePreferences } = notificationSlice.actions;
export default notificationSlice.reducer;

export type NotificationType = 'assigned' | 'mentioned' | 'due_soon';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  taskId?: string; // Optional link to task
  createdAt: string;
}

export interface NotificationPreferences {
  assigned: boolean;
  mentioned: boolean;
  due_soon: boolean;
  activity_ticker_alerts: boolean;
  email_digest: boolean;
  sound_enabled: boolean;
}

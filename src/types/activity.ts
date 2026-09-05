export type ActivityAction = 'created' | 'edited' | 'status_changed' | 'commented' | 'deleted';

export interface Activity {
  id: string;
  taskId: string;
  projectId: string;
  actorId: string; // user who performed the action
  action: ActivityAction;
  details?: string;
  createdAt: string;
}

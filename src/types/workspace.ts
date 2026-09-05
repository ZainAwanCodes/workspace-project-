import { Role } from './user';

export interface WorkspaceMember {
  userId: string;
  role: Role;
}

export interface Workspace {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  defaultView?: 'kanban' | 'list' | 'calendar';
  members: WorkspaceMember[];
}

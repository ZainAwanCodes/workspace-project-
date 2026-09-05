import { TaskStatus, TaskPriority } from './task';

export interface KanbanColumnDef {
  id: string;
  title: string;
  color?: string;
}

export const DEFAULT_KANBAN_COLUMNS: KanbanColumnDef[] = [
  { id: 'todo', title: 'To Do', color: '#64748b' },
  { id: 'in-progress', title: 'In Progress', color: '#3b82f6' },
  { id: 'review', title: 'Review', color: '#8b5cf6' },
  { id: 'done', title: 'Done', color: '#10b981' },
];

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  memberIds: string[]; // Subset of workspace members
  isArchived: boolean;
  kanbanColumns?: KanbanColumnDef[];
}

export interface TemplateTask {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  labels: string[];
  subtasks?: string[];
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  tasks: TemplateTask[];
}

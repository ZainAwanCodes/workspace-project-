import { TaskStatus, TaskPriority } from './task';

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  memberIds: string[]; // Subset of workspace members
  isArchived: boolean;
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

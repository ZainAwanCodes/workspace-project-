export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done' | string;
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface FileAttachment {
  id: string;
  fileName: string;
  fileType: string;
  data: string; // Base64 data
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
  labels: string[];
  attachments: FileAttachment[];
  subtasks: Subtask[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

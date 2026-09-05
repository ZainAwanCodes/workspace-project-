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

export interface ProjectTemplate {
  id: string;
  name: string;
  tasks: unknown[]; // Placeholder for template tasks structure
}

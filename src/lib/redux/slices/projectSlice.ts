import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import { Project, ProjectTemplate, KanbanColumnDef, DEFAULT_KANBAN_COLUMNS } from '@/types/project';

export const projectsAdapter = createEntityAdapter<Project>();

const initialProjects: Project[] = [
  {
    id: 'p1',
    workspaceId: 'w1',
    name: 'Website Redesign',
    description: 'Overhauling the main corporate website.',
    color: '#10b981',
    icon: 'layout',
    memberIds: ['u1', 'u2'],
    isArchived: false,
    kanbanColumns: DEFAULT_KANBAN_COLUMNS,
  },
  {
    id: 'p2',
    workspaceId: 'w1',
    name: 'Q3 Marketing Campaign',
    description: 'Assets and planning for Q3.',
    color: '#f59e0b',
    icon: 'megaphone',
    memberIds: ['u1', 'u3'],
    isArchived: false,
    kanbanColumns: DEFAULT_KANBAN_COLUMNS,
  }
];

const initialState = projectsAdapter.getInitialState({
  activeProjectId: 'p1' as string | null,
  templates: [] as ProjectTemplate[],
});

const projectSlice = createSlice({
  name: 'projects',
  initialState: projectsAdapter.setAll(initialState, initialProjects),
  reducers: {
    addProject: projectsAdapter.addOne,
    updateProject: projectsAdapter.updateOne,
    removeProject: projectsAdapter.removeOne,
    archiveProject: (state, action: PayloadAction<string>) => {
      const project = state.entities[action.payload];
      if (project) {
        project.isArchived = true;
      }
    },
    setActiveProject: (state, action: PayloadAction<string | null>) => {
      state.activeProjectId = action.payload;
    },
    addTemplate: (state, action: PayloadAction<ProjectTemplate>) => {
      state.templates.push(action.payload);
    },
    setProjectColumns: (state, action: PayloadAction<{ projectId: string; columns: KanbanColumnDef[] }>) => {
      const project = state.entities[action.payload.projectId];
      if (project) {
        project.kanbanColumns = action.payload.columns;
      }
    },
    addProjectColumn: (state, action: PayloadAction<{ projectId: string; column: KanbanColumnDef }>) => {
      const project = state.entities[action.payload.projectId];
      if (project) {
        if (!project.kanbanColumns) {
          project.kanbanColumns = [...DEFAULT_KANBAN_COLUMNS];
        }
        project.kanbanColumns.push(action.payload.column);
      }
    },
    updateProjectColumn: (state, action: PayloadAction<{ projectId: string; columnId: string; changes: Partial<KanbanColumnDef> }>) => {
      const project = state.entities[action.payload.projectId];
      if (project && project.kanbanColumns) {
        const index = project.kanbanColumns.findIndex(c => c.id === action.payload.columnId);
        if (index !== -1) {
          project.kanbanColumns[index] = { ...project.kanbanColumns[index], ...action.payload.changes };
        }
      }
    },
    removeProjectColumn: (state, action: PayloadAction<{ projectId: string; columnId: string }>) => {
      const project = state.entities[action.payload.projectId];
      if (project && project.kanbanColumns) {
        project.kanbanColumns = project.kanbanColumns.filter(c => c.id !== action.payload.columnId);
      }
    }
  }
});

export const {
  addProject, updateProject, removeProject, archiveProject, setActiveProject, addTemplate,
  setProjectColumns, addProjectColumn, updateProjectColumn, removeProjectColumn
} = projectSlice.actions;

export default projectSlice.reducer;

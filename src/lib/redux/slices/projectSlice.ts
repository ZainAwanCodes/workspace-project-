import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import { Project, ProjectTemplate } from '@/types/project';

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
    }
  }
});

export const {
  addProject, updateProject, removeProject, archiveProject, setActiveProject, addTemplate
} = projectSlice.actions;

export default projectSlice.reducer;

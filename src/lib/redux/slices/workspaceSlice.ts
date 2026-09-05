import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import { Workspace, WorkspaceMember } from '@/types/workspace';

export const workspacesAdapter = createEntityAdapter<Workspace>();

const initialWorkspaces: Workspace[] = [
  {
    id: 'w1',
    name: 'Acme Corp',
    icon: 'briefcase',
    color: '#3b82f6',
    defaultView: 'kanban',
    members: [
      { userId: 'u1', role: 'owner' },
      { userId: 'u2', role: 'admin' },
      { userId: 'u3', role: 'member' },
    ]
  }
];

const initialState = workspacesAdapter.getInitialState({
  activeWorkspaceId: 'w1' as string | null,
});

const workspaceSlice = createSlice({
  name: 'workspaces',
  initialState: workspacesAdapter.setAll(initialState, initialWorkspaces),
  reducers: {
    addWorkspace: workspacesAdapter.addOne,
    updateWorkspace: workspacesAdapter.updateOne,
    removeWorkspace: workspacesAdapter.removeOne,
    setActiveWorkspace: (state, action: PayloadAction<string | null>) => {
      state.activeWorkspaceId = action.payload;
    },
    addMember: (state, action: PayloadAction<{ workspaceId: string; member: WorkspaceMember }>) => {
      const workspace = state.entities[action.payload.workspaceId];
      if (workspace) {
        workspace.members.push(action.payload.member);
      }
    },
    updateMemberRole: (state, action: PayloadAction<{ workspaceId: string; userId: string; role: WorkspaceMember['role'] }>) => {
      const workspace = state.entities[action.payload.workspaceId];
      if (workspace) {
        const member = workspace.members.find(m => m.userId === action.payload.userId);
        if (member) {
          member.role = action.payload.role;
        }
      }
    },
    removeMember: (state, action: PayloadAction<{ workspaceId: string; userId: string }>) => {
      const workspace = state.entities[action.payload.workspaceId];
      if (workspace) {
        workspace.members = workspace.members.filter(m => m.userId !== action.payload.userId);
      }
    }
  }
});

export const { 
  addWorkspace, updateWorkspace, removeWorkspace, setActiveWorkspace,
  addMember, updateMemberRole, removeMember
} = workspaceSlice.actions;

export default workspaceSlice.reducer;

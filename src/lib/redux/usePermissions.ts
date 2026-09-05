import { useAppSelector } from './hooks';
import { Role } from '@/types/user';

export const useCurrentRole = (): Role | null => {
  const currentUser = useAppSelector(state => state.auth.currentUser);
  const activeWorkspaceId = useAppSelector(state => state.workspaces.activeWorkspaceId);
  const activeWorkspace = useAppSelector(state => 
    activeWorkspaceId ? state.workspaces.entities[activeWorkspaceId] : null
  );

  if (!currentUser || !activeWorkspace) return null;

  const member = activeWorkspace.members.find(m => m.userId === currentUser.id);
  return member ? member.role : null;
};

export const useHasPermission = (requiredRoles: Role[]) => {
  const role = useCurrentRole();
  if (!role) return false;
  return requiredRoles.includes(role);
};

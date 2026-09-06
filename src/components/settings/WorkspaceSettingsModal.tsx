import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { 
  updateWorkspace, removeWorkspace, setActiveWorkspace, 
  addMember, updateMemberRole, removeMember 
} from '@/lib/redux/slices/workspaceSlice';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import { 
  AlertCircle, Trash2, UserPlus, Shield, Kanban, 
  List as ListIcon, Calendar, Check, UserMinus 
} from 'lucide-react';
import { AVAILABLE_ICONS, PRESET_COLORS, DynamicIcon } from '@/utils/iconMap';
import { Role } from '@/types/user';

interface WorkspaceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROLE_COLORS: Record<Role, 'blue' | 'purple' | 'green' | 'gray'> = {
  owner: 'purple',
  admin: 'blue',
  member: 'green',
  viewer: 'gray',
};

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  owner: 'Full ownership, billing, delete workspace',
  admin: 'Manage projects, members, and settings',
  member: 'Create, edit, and move project tasks',
  viewer: 'Read-only access to boards and views',
};

export const WorkspaceSettingsModal = ({ isOpen, onClose }: WorkspaceSettingsModalProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const activeWorkspaceId = useAppSelector(state => state.workspaces.activeWorkspaceId);
  const allWorkspaces = useAppSelector(state =>
    state.workspaces.ids.map(id => state.workspaces.entities[id]!)
  );
  const workspace = useAppSelector(state => 
    activeWorkspaceId ? state.workspaces.entities[activeWorkspaceId] : null
  );
  const allUsers = useAppSelector(state => state.auth.users);
  const currentUser = useAppSelector(state => state.auth.currentUser);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('briefcase');
  const [color, setColor] = useState('#3b82f6');
  const [defaultView, setDefaultView] = useState<'kanban' | 'list' | 'calendar'>('kanban');
  
  // Invite state
  const [selectedInviteUserId, setSelectedInviteUserId] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('member');
  
  // Danger Zone
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  useEffect(() => {
    if (workspace && isOpen) {
      setName(workspace.name);
      setIcon(workspace.icon || 'briefcase');
      setColor(workspace.color || '#3b82f6');
      setDefaultView(workspace.defaultView || 'kanban');
      setDeleteConfirmation('');
      setSelectedInviteUserId('');
      setInviteRole('member');
    }
  }, [workspace, isOpen]);

  const handleUpdateGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !workspace) return;

    dispatch(updateWorkspace({
      id: workspace.id,
      changes: {
        name: name.trim(),
        icon,
        color,
        defaultView,
      }
    }));
    
    onClose();
  };

  const handleRoleChange = (userId: string, newRole: Role) => {
    if (!workspace) return;
    dispatch(updateMemberRole({
      workspaceId: workspace.id,
      userId,
      role: newRole,
    }));
  };

  const handleRemoveMember = (userId: string) => {
    if (!workspace) return;
    // Prevent removing the sole owner if it's currentUser
    if (workspace.members.filter(m => m.role === 'owner').length <= 1) {
      const isSoleOwner = workspace.members.some(m => m.userId === userId && m.role === 'owner');
      if (isSoleOwner) {
        alert('Workspace must have at least one owner.');
        return;
      }
    }

    dispatch(removeMember({
      workspaceId: workspace.id,
      userId,
    }));
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace || !selectedInviteUserId) return;

    dispatch(addMember({
      workspaceId: workspace.id,
      member: {
        userId: selectedInviteUserId,
        role: inviteRole,
      }
    }));

    setSelectedInviteUserId('');
    setInviteRole('member');
  };

  const isDeleteConfirmed = workspace
    ? deleteConfirmation.trim().toLowerCase() === workspace.name.trim().toLowerCase()
    : false;

  const handleDelete = () => {
    if (!workspace || !isDeleteConfirmed) return;

    const remainingWorkspaces = allWorkspaces.filter(w => w.id !== workspace.id);

    dispatch(removeWorkspace(workspace.id));
    onClose();

    if (remainingWorkspaces.length > 0) {
      const nextWorkspace = remainingWorkspaces[0];
      dispatch(setActiveWorkspace(nextWorkspace.id));
      navigate(`/w/${nextWorkspace.id}`);
    } else {
      dispatch(setActiveWorkspace(null));
      navigate('/');
    }
  };

  if (!workspace) return null;

  // Uninvited mock users available to add
  const uninvitedUsers = allUsers.filter(
    u => !workspace.members.some(m => m.userId === u.id)
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Workspace Settings" size="lg">
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">
            Members ({workspace.members.length})
          </TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        {/* Tab 1: General Settings */}
        <TabsContent value="general" className="space-y-6 pt-2">
          <form onSubmit={handleUpdateGeneral} className="space-y-5">
            <div className="flex items-start space-x-4">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0 transition-colors"
                style={{ backgroundColor: color }}
              >
                <DynamicIcon name={icon} size={28} />
              </div>
              <div className="flex-1">
                <Input 
                  label="Workspace Name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Workspace Icon
              </label>
              <div className="grid grid-cols-6 gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                {AVAILABLE_ICONS.map((item) => {
                  const isSelected = icon === item.id;
                  const IconComp = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setIcon(item.id)}
                      className={`h-9 flex items-center justify-center rounded-md transition-colors ${
                        isSelected 
                          ? 'bg-blue-600 text-white shadow-xs' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                      }`}
                    >
                      <IconComp size={18} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color Accent */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Accent Color
              </label>
              <div className="flex items-center space-x-2">
                {PRESET_COLORS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setColor(hex)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                    style={{ backgroundColor: hex }}
                  >
                    {color === hex && <Check size={14} className="text-white" />}
                  </button>
                ))}
                <input 
                  type="color" 
                  value={color} 
                  onChange={(e) => setColor(e.target.value)}
                  className="w-7 h-7 rounded-full cursor-pointer border-0 p-0 ml-1 overflow-hidden"
                />
              </div>
            </div>

            {/* Default View Mode */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Default Project View
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'kanban' as const, label: 'Kanban', icon: Kanban },
                  { id: 'list' as const, label: 'List', icon: ListIcon },
                  { id: 'calendar' as const, label: 'Calendar', icon: Calendar },
                ].map((v) => {
                  const isSelected = defaultView === v.id;
                  const IconComp = v.icon;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setDefaultView(v.id)}
                      className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <IconComp size={16} />
                      <span>{v.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 flex justify-end space-x-3 border-t border-gray-100 dark:border-gray-800">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={!name.trim()}>
                Save Workspace Settings
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* Tab 2: Members & Roles */}
        <TabsContent value="members" className="space-y-6 pt-2">
          {/* Invite Member Section */}
          <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 rounded-xl p-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-900 dark:text-blue-300 mb-3 flex items-center">
              <UserPlus size={14} className="mr-1.5" />
              Invite Team Member
            </h4>
            <form onSubmit={handleInviteMember} className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedInviteUserId}
                onChange={(e) => setSelectedInviteUserId(e.target.value)}
                className="flex-1 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select team member to invite...</option>
                {uninvitedUsers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>

              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as Role)}
                className="text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 w-32"
              >
                <option value="viewer">Viewer</option>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
              </select>

              <Button 
                type="submit" 
                size="sm" 
                disabled={!selectedInviteUserId}
                className="whitespace-nowrap"
              >
                Add Member
              </Button>
            </form>
            {uninvitedUsers.length === 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                All available mock team profiles have been added to this workspace.
              </p>
            )}
          </div>

          {/* Members List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Current Members ({workspace.members.length})
              </span>
              <span className="text-xs text-gray-400">Roles are simulated client-side</span>
            </div>

            <div className="border border-gray-200 dark:border-gray-800 rounded-xl divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
              {workspace.members.map((member) => {
                const user = allUsers.find(u => u.id === member.userId);
                if (!user) return null;
                const isCurrentUser = user.id === currentUser?.id;

                return (
                  <div key={member.userId} className="p-3.5 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Avatar name={user.name} src={user.avatar} size="md" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </span>
                          {isCurrentUser && (
                            <Badge variant="blue" className="text-[10px] px-1.5 py-0">You</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                          {ROLE_DESCRIPTIONS[member.role]}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.userId, e.target.value as Role)}
                        className="text-xs font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                        <option value="viewer">Viewer</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.userId)}
                        title="Remove member"
                        className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <UserMinus size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Danger Zone */}
        <TabsContent value="danger" className="pt-2">
          <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-xl border border-red-100 dark:border-red-900/30 space-y-4">
            <div className="flex items-center space-x-2 text-red-600 dark:text-red-500 font-semibold text-sm">
              <AlertCircle size={18} />
              <span>Delete this Workspace</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Deleting a workspace is permanent and cannot be undone. All associated projects, 
              columns, tasks, subtasks, and comments will be completely deleted from local state.
            </p>
            
            <div>
              <label className="block text-xs font-medium text-red-800 dark:text-red-400 mb-2">
                Type <span className="font-bold underline">{workspace.name}</span> to confirm deletion:
              </label>
              <Input 
                value={deleteConfirmation} 
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder={workspace.name}
              />
            </div>

            <Button 
              variant="destructive" 
              className="w-full"
              disabled={!isDeleteConfirmed}
              onClick={handleDelete}
            >
              <Trash2 size={16} className="mr-2" />
              I understand, delete this workspace
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </Modal>
  );
};

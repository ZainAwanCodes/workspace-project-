import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { updateProject, removeProject, archiveProject, setActiveProject } from '@/lib/redux/slices/projectSlice';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Avatar } from '@/components/ui/Avatar';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Trash2, Archive, Users, Check } from 'lucide-react';
import { AVAILABLE_ICONS, PRESET_COLORS, DynamicIcon } from '@/utils/iconMap';

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export const ProjectSettingsModal = ({ isOpen, onClose, projectId }: ProjectSettingsModalProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const project = useAppSelector(state => state.projects.entities[projectId]);
  const activeWorkspaceId = useAppSelector(state => state.workspaces.activeWorkspaceId);
  const workspace = useAppSelector(state => activeWorkspaceId ? state.workspaces.entities[activeWorkspaceId] : null);
  const allUsers = useAppSelector(state => state.auth.users);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [icon, setIcon] = useState('layout');
  const [memberIds, setMemberIds] = useState<string[]>([]);
  
  // Danger Zone
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Workspace members only
  const workspaceMembers = (workspace?.members || [])
    .map(m => allUsers.find(u => u.id === m.userId))
    .filter(Boolean) as typeof allUsers;

  useEffect(() => {
    if (project && isOpen) {
      setName(project.name);
      setDescription(project.description || '');
      setColor(project.color || '#3b82f6');
      setIcon(project.icon || 'layout');
      setMemberIds(project.memberIds || []);
      setDeleteConfirmation('');
    }
  }, [project, isOpen]);

  const handleToggleMember = (userId: string) => {
    if (memberIds.includes(userId)) {
      setMemberIds(memberIds.filter(id => id !== userId));
    } else {
      setMemberIds([...memberIds, userId]);
    }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !project) return;

    dispatch(updateProject({
      id: project.id,
      changes: {
        name: name.trim(),
        description: description.trim() || undefined,
        color,
        icon,
        memberIds: memberIds.length > 0 ? memberIds : project.memberIds,
      }
    }));
    
    onClose();
  };

  const handleArchiveToggle = () => {
    if (!project) return;
    if (project.isArchived) {
      dispatch(updateProject({
        id: project.id,
        changes: { isArchived: false }
      }));
      onClose();
    } else {
      dispatch(archiveProject(project.id));
      onClose();
      if (activeWorkspaceId) {
        navigate(`/w/${activeWorkspaceId}`);
      }
    }
  };

  const handleDelete = () => {
    if (!project) return;
    if (deleteConfirmation !== project.name) return;

    dispatch(removeProject(project.id));
    dispatch(setActiveProject(null));
    onClose();
    if (activeWorkspaceId) {
      navigate(`/w/${activeWorkspaceId}`);
    } else {
      navigate('/');
    }
  };

  if (!project) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Project Settings" size="lg">
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">
            Members ({memberIds.length})
          </TabsTrigger>
          <TabsTrigger value="danger">Danger Zone</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6 pt-2">
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="flex items-start space-x-4">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0 transition-colors"
                style={{ backgroundColor: color }}
              >
                <DynamicIcon name={icon} size={28} />
              </div>
              <div className="flex-1">
                <Input 
                  label="Project Name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-sm bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none h-20"
                placeholder="Brief description of project goals and scope"
              />
            </div>

            {/* Icon Tagging */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Project Icon
              </label>
              <div className="grid grid-cols-6 gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                {AVAILABLE_ICONS.slice(0, 12).map((item) => {
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
                Project Color Tag
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

            <div className="pt-3 flex justify-end space-x-3 border-t border-gray-100 dark:border-gray-800">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={!name.trim()}>
                Save Project Changes
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center">
                <Users size={16} className="mr-1.5 text-blue-500" />
                Assigned Project Members
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Select which team members from <span className="font-medium">{workspace?.name}</span> have access to this project.
              </p>
            </div>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              {memberIds.length} assigned
            </span>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 rounded-xl divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden max-h-64 overflow-y-auto">
            {workspaceMembers.map((user) => {
              const isAssigned = memberIds.includes(user.id);
              return (
                <div
                  key={user.id}
                  onClick={() => handleToggleMember(user.id)}
                  className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                    isAssigned
                      ? 'bg-blue-50/50 dark:bg-blue-950/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-900/30'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar name={user.name} src={user.avatar} size="sm" />
                    <div>
                      <div className="text-xs font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </div>
                      <div className="text-[11px] text-gray-400">{user.email}</div>
                    </div>
                  </div>

                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    isAssigned
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-gray-300 dark:border-gray-700'
                  }`}>
                    {isAssigned && <Check size={13} />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex justify-end">
            <Button onClick={handleUpdate}>
              Save Member Assignments
            </Button>
          </div>
        </TabsContent>

        {/* Danger Zone */}
        <TabsContent value="danger" className="space-y-4 pt-2">
          {/* Archive Option */}
          <div className="border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/10 p-4 rounded-xl flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-300 flex items-center">
                <Archive size={16} className="mr-1.5" />
                {project.isArchived ? 'Unarchive Project' : 'Archive Project'}
              </h4>
              <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-0.5">
                {project.isArchived 
                  ? 'Restore this project to the active project navigation list.' 
                  : 'Hide this project from active navigation while preserving all tasks and data.'}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleArchiveToggle}
              className="border-amber-300 text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 whitespace-nowrap"
            >
              {project.isArchived ? 'Unarchive' : 'Archive'}
            </Button>
          </div>

          {/* Delete Option */}
          <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30 space-y-3">
            <h4 className="text-sm font-semibold text-red-600 dark:text-red-500 flex items-center">
              <AlertCircle size={16} className="mr-1.5" />
              Delete Project
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              Deleting this project is permanent. All tasks and comments inside this project will be destroyed.
            </p>
            
            <div>
              <label className="block text-xs font-medium text-red-800 dark:text-red-400 mb-1.5">
                Type <span className="font-bold underline">{project.name}</span> to confirm:
              </label>
              <Input 
                value={deleteConfirmation} 
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder={project.name}
              />
            </div>

            <Button 
              variant="destructive" 
              className="w-full"
              disabled={deleteConfirmation !== project.name}
              onClick={handleDelete}
            >
              <Trash2 size={16} className="mr-2" />
              Delete this project permanently
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </Modal>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { addProject } from '@/lib/redux/slices/projectSlice';
import { addTasks } from '@/lib/redux/slices/taskSlice';
import { logActivity } from '@/lib/redux/slices/activitySlice';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { AVAILABLE_ICONS, PRESET_COLORS, DynamicIcon } from '@/utils/iconMap';
import { PROJECT_TEMPLATES } from '@/data/projectTemplates';
import { nanoid } from '@reduxjs/toolkit';
import { Task } from '@/types/task';
import { Check, Sparkles, Users } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const workspace = useAppSelector(state => state.workspaces.entities[workspaceId]);
  const allUsers = useAppSelector(state => state.auth.users);
  const currentUser = useAppSelector(state => state.auth.currentUser);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('layout');
  const [color, setColor] = useState('#3b82f6');
  const [selectedTemplateId, setSelectedTemplateId] = useState('blank');
  const [assignedMemberIds, setAssignedMemberIds] = useState<string[]>(
    currentUser ? [currentUser.id] : []
  );

  // Workspace members only
  const workspaceMembers = (workspace?.members || [])
    .map(m => allUsers.find(u => u.id === m.userId))
    .filter(Boolean) as typeof allUsers;

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = PROJECT_TEMPLATES.find(t => t.id === templateId);
    if (template && template.id !== 'blank') {
      setIcon(template.icon);
      setColor(template.color);
      if (!name) {
        setName(template.name);
      }
      if (!description) {
        setDescription(template.description);
      }
    }
  };

  const handleToggleMember = (userId: string) => {
    if (assignedMemberIds.includes(userId)) {
      setAssignedMemberIds(assignedMemberIds.filter(id => id !== userId));
    } else {
      setAssignedMemberIds([...assignedMemberIds, userId]);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !workspace) return;

    const newProjectId = `p_${nanoid(8)}`;
    const template = PROJECT_TEMPLATES.find(t => t.id === selectedTemplateId);

    // 1. Create project
    dispatch(addProject({
      id: newProjectId,
      workspaceId: workspace.id,
      name: name.trim(),
      description: description.trim() || undefined,
      color,
      icon,
      memberIds: assignedMemberIds.length > 0 ? assignedMemberIds : [currentUser?.id || 'u1'],
      isArchived: false,
    }));

    // 2. Generate and add starter tasks from template if selected
    if (template && template.tasks.length > 0) {
      const now = new Date();
      const generatedTasks: Task[] = template.tasks.map((tplTask, index) => {
        const taskId = `t_${nanoid(8)}`;
        const dueDate = new Date(now.getTime() + (index + 2) * 24 * 60 * 60 * 1000).toISOString();
        const assignee = assignedMemberIds[index % assignedMemberIds.length] || currentUser?.id;

        return {
          id: taskId,
          projectId: newProjectId,
          title: tplTask.title,
          description: tplTask.description || '',
          status: tplTask.status,
          priority: tplTask.priority,
          dueDate,
          assigneeId: assignee,
          labels: tplTask.labels,
          attachments: [],
          subtasks: (tplTask.subtasks || []).map((stTitle, stIdx) => ({
            id: `st_${nanoid(6)}`,
            taskId,
            title: stTitle,
            isCompleted: stIdx === 0 && tplTask.status === 'done',
          })),
          comments: [],
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        };
      });

      dispatch(addTasks(generatedTasks));
    }

    // 3. Log activity
    dispatch(logActivity({
      id: `act_${nanoid(8)}`,
      taskId: '',
      projectId: newProjectId,
      actorId: currentUser?.id || 'u1',
      action: 'created',
      details: `Created project "${name.trim()}" ${template && template.id !== 'blank' ? `from template "${template.name}"` : ''}`,
      createdAt: new Date().toISOString(),
    }));

    // Reset and redirect
    onClose();
    setName('');
    setDescription('');
    setSelectedTemplateId('blank');
    navigate(`/w/${workspace.id}/p/${newProjectId}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project" size="lg">
      <form onSubmit={handleCreate} className="space-y-6 max-h-[75vh] overflow-y-auto px-1 pr-2">
        {/* Templates Picker Section */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2.5 flex items-center">
            <Sparkles size={14} className="mr-1.5 text-blue-500" />
            Start from a Template
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PROJECT_TEMPLATES.map((tpl) => {
              const isSelected = selectedTemplateId === tpl.id;
              return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleTemplateSelect(tpl.id)}
                  className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 shadow-xs'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 mb-1.5">
                    <div 
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs shadow-2xs"
                      style={{ backgroundColor: tpl.color }}
                    >
                      <DynamicIcon name={tpl.icon} size={15} />
                    </div>
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                      {tpl.name}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                    {tpl.description}
                  </p>
                  <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                    {tpl.tasks.length === 0 ? 'Empty starter' : `${tpl.tasks.length} preconfigured tasks`}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Project Name & Description */}
        <div className="space-y-4">
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
                placeholder="e.g. Q4 Growth Roadmap"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none h-20"
              placeholder="What are the goals and deliverables for this project?"
            />
          </div>
        </div>

        {/* Icon & Color Tagging */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Project Icon
            </label>
            <div className="grid grid-cols-6 gap-1.5 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              {AVAILABLE_ICONS.slice(0, 12).map((item) => {
                const isSelected = icon === item.id;
                const IconComp = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIcon(item.id)}
                    className={`h-8 flex items-center justify-center rounded-md transition-colors ${
                      isSelected 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                    }`}
                  >
                    <IconComp size={16} />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Color Tag
            </label>
            <div className="flex flex-wrap gap-2 items-center p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              {PRESET_COLORS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setColor(hex)}
                  className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                  style={{ backgroundColor: hex }}
                >
                  {color === hex && <Check size={12} className="text-white" />}
                </button>
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-6 h-6 rounded-full cursor-pointer border-0 p-0 overflow-hidden"
              />
            </div>
          </div>
        </div>

        {/* Project-level Member Assignment */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center">
              <Users size={14} className="mr-1.5" />
              Project Members ({assignedMemberIds.length})
            </label>
            <span className="text-xs text-gray-400">Assign members from {workspace?.name}</span>
          </div>

          <div className="space-y-1.5 max-h-36 overflow-y-auto border border-gray-200 dark:border-gray-800 rounded-lg p-2 bg-gray-50/50 dark:bg-gray-900/50">
            {workspaceMembers.map((user) => {
              const isAssigned = assignedMemberIds.includes(user.id);
              return (
                <div
                  key={user.id}
                  onClick={() => handleToggleMember(user.id)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-sm cursor-pointer transition-colors ${
                    isAssigned
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Avatar name={user.name} src={user.avatar} size="xs" />
                    <div>
                      <div className="text-xs font-medium">{user.name}</div>
                      <div className="text-[11px] text-gray-400">{user.email}</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    isAssigned 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'border-gray-300 dark:border-gray-700'
                  }`}>
                    {isAssigned && <Check size={12} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-3 flex justify-end space-x-3 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!name.trim()}>
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};

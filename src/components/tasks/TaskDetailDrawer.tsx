import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { updateTask, removeTask, moveTaskStatus, duplicateTask } from '@/lib/redux/slices/taskSlice';
import { logActivity } from '@/lib/redux/slices/activitySlice';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { 
  Calendar, 
  Trash2, 
  Copy, 
  Check, 
  MessageSquare, 
  Plus, 
  Activity, 
  Tag, 
  Flag, 
  User, 
  FileText,
  X,
  Clock,
  Layers
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { CommentThread } from './CommentThread';
import { ActivityFeed } from '../activity/ActivityFeed';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { SubtaskList } from './SubtaskList';
import { TaskAttachments } from './TaskAttachments';
import { DynamicIcon } from '@/utils/iconMap';
import { nanoid } from '@reduxjs/toolkit';

interface TaskDetailDrawerProps {
  taskId: string | null;
  onClose: () => void;
}

const COMMON_TAGS = ['frontend', 'backend', 'design', 'bug', 'feature', 'marketing', 'docs', 'urgent'];

export const TaskDetailDrawer = ({ taskId, onClose }: TaskDetailDrawerProps) => {
  const dispatch = useAppDispatch();
  const task = useAppSelector(state => 
    taskId ? state.tasks.entities[taskId] : null
  ) as Task | null;
  
  const users = useAppSelector(state => state.auth.users);
  const currentUser = useAppSelector(state => state.auth.currentUser);
  
  const project = useAppSelector(state => 
    task ? state.projects.entities[task.projectId] : null
  );

  const workspace = useAppSelector(state => 
    project ? state.workspaces.entities[project.workspaceId] : null
  );

  const [copiedLink, setCopiedLink] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  if (!task) return null;

  const assignee = users.find(u => u.id === task.assigneeId);
  const projectMembers = users.filter(u => 
    project?.memberIds ? project.memberIds.includes(u.id) : true
  );

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      dispatch(removeTask(task.id));
      onClose();
    }
  };

  const handleDuplicate = () => {
    dispatch(duplicateTask(task.id));
    if (currentUser) {
      dispatch(logActivity({
        id: nanoid(),
        taskId: task.id,
        projectId: task.projectId,
        actorId: currentUser.id,
        action: 'created',
        details: `Duplicated task "${task.title}"`,
        createdAt: new Date().toISOString(),
      }));
    }
    onClose();
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/#task-${task.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    dispatch(moveTaskStatus({ id: task.id, status: newStatus }));
    if (currentUser) {
      dispatch(logActivity({
        id: nanoid(),
        taskId: task.id,
        projectId: task.projectId,
        actorId: currentUser.id,
        action: 'status_changed',
        details: `Status changed to ${newStatus.replace('-', ' ')}`,
        createdAt: new Date().toISOString(),
      }));
    }
  };

  const handlePriorityChange = (newPriority: TaskPriority) => {
    dispatch(updateTask({ id: task.id, changes: { priority: newPriority } }));
    if (currentUser) {
      dispatch(logActivity({
        id: nanoid(),
        taskId: task.id,
        projectId: task.projectId,
        actorId: currentUser.id,
        action: 'priority_changed',
        details: `Priority changed to ${newPriority}`,
        createdAt: new Date().toISOString(),
      }));
    }
  };

  const handleAssigneeChange = (userId?: string) => {
    dispatch(updateTask({ id: task.id, changes: { assigneeId: userId || undefined } }));
    if (currentUser) {
      const targetUser = users.find(u => u.id === userId);
      dispatch(logActivity({
        id: nanoid(),
        taskId: task.id,
        projectId: task.projectId,
        actorId: currentUser.id,
        action: 'assigned',
        details: targetUser ? `Assigned to ${targetUser.name}` : 'Unassigned task',
        createdAt: new Date().toISOString(),
      }));
    }
  };

  const handleDueDateChange = (dateStr: string) => {
    const isoDate = dateStr ? new Date(dateStr).toISOString() : undefined;
    dispatch(updateTask({ id: task.id, changes: { dueDate: isoDate } }));
    if (currentUser) {
      dispatch(logActivity({
        id: nanoid(),
        taskId: task.id,
        projectId: task.projectId,
        actorId: currentUser.id,
        action: 'edited',
        details: dateStr ? `Due date set to ${format(new Date(dateStr), 'MMM d, yyyy')}` : 'Cleared due date',
        createdAt: new Date().toISOString(),
      }));
    }
  };

  const handleAddTag = (tag: string) => {
    const clean = tag.trim().toLowerCase();
    if (clean && !task.labels.includes(clean)) {
      const updated = [...task.labels, clean];
      dispatch(updateTask({ id: task.id, changes: { labels: updated } }));
      if (currentUser) {
        dispatch(logActivity({
          id: nanoid(),
          taskId: task.id,
          projectId: task.projectId,
          actorId: currentUser.id,
          action: 'edited',
          details: `Added tag #${clean}`,
          createdAt: new Date().toISOString(),
        }));
      }
    }
    setNewTagInput('');
    setIsAddingTag(false);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = task.labels.filter(l => l !== tagToRemove);
    dispatch(updateTask({ id: task.id, changes: { labels: updated } }));
  };

  return (
    <Drawer 
      isOpen={!!taskId} 
      onClose={onClose} 
      title={
        <div className="flex items-center space-x-2 text-xs text-gray-500 overflow-hidden pr-6">
          {workspace && (
            <span className="truncate max-w-[120px] font-medium text-gray-700 dark:text-gray-300">
              {workspace.name}
            </span>
          )}
          <span>/</span>
          {project && (
            <div className="flex items-center space-x-1.5 font-medium text-gray-700 dark:text-gray-300">
              <span 
                className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                style={{ backgroundColor: project.color || '#3b82f6' }}
              />
              <span className="truncate max-w-[140px]">{project.name}</span>
            </div>
          )}
          <span>/</span>
          <span className="text-gray-400 truncate max-w-[160px]">{task.title}</span>
        </div>
      }
      size="xl"
    >
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Main Content (Left) */}
        <div className="flex-1 space-y-6 min-w-0">
          
          {/* Title Edit */}
          <div>
            <input
              type="text"
              value={task.title}
              onChange={(e) => dispatch(updateTask({ id: task.id, changes: { title: e.target.value } }))}
              className="w-full text-xl sm:text-2xl font-semibold bg-transparent border-none focus:ring-0 p-0 text-gray-900 dark:text-white placeholder-gray-400 tracking-tight leading-tight"
              placeholder="Task title"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center">
              <FileText size={14} className="mr-1.5" /> Description
            </h3>
            <textarea
              value={task.description || ''}
              onChange={(e) => dispatch(updateTask({ id: task.id, changes: { description: e.target.value } }))}
              placeholder="Add context, acceptance criteria, or technical details..."
              rows={4}
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:bg-white dark:focus:bg-gray-950 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y"
            />
          </div>

          {/* Subtasks */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800/80">
            <SubtaskList task={task} />
          </div>

          {/* Attachments */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-800/80">
            <TaskAttachments task={task} />
          </div>

          {/* Activity / Comments Tabs */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-800/80">
            <Tabs defaultValue="discussion">
              <TabsList>
                <TabsTrigger value="discussion">
                  <MessageSquare size={14} className="mr-1.5 inline"/> Discussion ({task.comments?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="activity">
                  <Activity size={14} className="mr-1.5 inline"/> Activity History
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="discussion" className="mt-4">
                <CommentThread 
                  taskId={task.id} 
                  comments={task.comments || []} 
                  projectId={task.projectId} 
                />
              </TabsContent>
              
              <TabsContent value="activity" className="mt-4">
                <ActivityFeed taskId={task.id} />
              </TabsContent>
            </Tabs>
          </div>

        </div>

        {/* Sidebar (Right) */}
        <div className="w-full lg:w-64 space-y-6 flex-shrink-0">
          
          <div className="space-y-4 bg-gray-50/70 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select 
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                className="w-full rounded-lg border-gray-200 dark:border-gray-700 shadow-xs focus:border-blue-500 focus:ring-blue-500 text-xs font-medium bg-white dark:bg-gray-950 py-2"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Assignee
              </label>
              <select
                value={task.assigneeId || ''}
                onChange={(e) => handleAssigneeChange(e.target.value || undefined)}
                className="w-full rounded-lg border-gray-200 dark:border-gray-700 shadow-xs focus:border-blue-500 focus:ring-blue-500 text-xs bg-white dark:bg-gray-950 py-2"
              >
                <option value="">Unassigned</option>
                {projectMembers.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : ''}
                onChange={(e) => handleDueDateChange(e.target.value)}
                className="w-full rounded-lg border-gray-200 dark:border-gray-700 shadow-xs focus:border-blue-500 focus:ring-blue-500 text-xs bg-white dark:bg-gray-950 py-1.5"
              />
              <div className="flex items-center space-x-2 mt-1.5">
                <button
                  type="button"
                  onClick={() => handleDueDateChange(format(new Date(), 'yyyy-MM-dd'))}
                  className="text-[11px] text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                >
                  Today
                </button>
                <span className="text-gray-300">·</span>
                <button
                  type="button"
                  onClick={() => handleDueDateChange(format(addDays(new Date(), 1), 'yyyy-MM-dd'))}
                  className="text-[11px] text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                >
                  Tomorrow
                </button>
                <span className="text-gray-300">·</span>
                {task.dueDate && (
                  <button
                    type="button"
                    onClick={() => handleDueDateChange('')}
                    className="text-[11px] text-red-500 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select 
                value={task.priority}
                onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
                className="w-full rounded-lg border-gray-200 dark:border-gray-700 shadow-xs focus:border-blue-500 focus:ring-blue-500 text-xs font-medium bg-white dark:bg-gray-950 py-2 uppercase tracking-wider"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Labels / Tags Manager */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Labels & Tags</span>
                <button
                  type="button"
                  onClick={() => setIsAddingTag(!isAddingTag)}
                  className="text-blue-600 dark:text-blue-400 text-[11px] hover:underline"
                >
                  {isAddingTag ? 'Cancel' : '+ Add'}
                </button>
              </label>

              <div className="flex flex-wrap gap-1.5 mb-2">
                {task.labels.length === 0 ? (
                  <span className="text-xs text-gray-400 italic">No labels</span>
                ) : (
                  task.labels.map(label => (
                    <span 
                      key={label}
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                    >
                      {label}
                      <button
                        onClick={() => handleRemoveTag(label)}
                        className="ml-1 text-blue-400 hover:text-blue-600 dark:hover:text-blue-200"
                        title="Remove tag"
                      >
                        <X size={11} />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {isAddingTag && (
                <div className="space-y-1.5 mt-2">
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="text"
                      autoFocus
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag(newTagInput);
                        }
                      }}
                      placeholder="Tag name..."
                      className="flex-1 text-xs rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-2 py-1"
                    />
                    <Button 
                      size="sm" 
                      onClick={() => handleAddTag(newTagInput)}
                      disabled={!newTagInput.trim()}
                      className="text-xs h-7 px-2"
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {COMMON_TAGS.filter(t => !task.labels.includes(t)).slice(0, 4).map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => handleAddTag(s)}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                      >
                        +{s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Actions */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-200 dark:border-gray-800 pb-2">
              Actions
            </h4>
            
            <Button 
              variant="outline" 
              className="w-full justify-start text-xs text-gray-700 dark:text-gray-300"
              onClick={handleDuplicate}
            >
              <Copy size={13} className="mr-2" /> Duplicate Task
            </Button>

            <Button 
              variant="outline" 
              className="w-full justify-start text-xs text-gray-700 dark:text-gray-300"
              onClick={handleCopyLink}
            >
              {copiedLink ? (
                <>
                  <Check size={13} className="mr-2 text-green-500" /> Copied Link!
                </>
              ) : (
                <>
                  <Copy size={13} className="mr-2" /> Copy Link
                </>
              )}
            </Button>

            <Button 
              variant="destructive" 
              className="w-full justify-start text-xs"
              onClick={handleDelete}
            >
              <Trash2 size={13} className="mr-2" /> Delete Task
            </Button>
          </div>

        </div>
      </div>
    </Drawer>
  );
};

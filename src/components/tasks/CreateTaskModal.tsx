import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { addTask } from '@/lib/redux/slices/taskSlice';
import { logActivity } from '@/lib/redux/slices/activitySlice';
import { Task, TaskStatus, TaskPriority, Subtask } from '@/types/task';
import { DEFAULT_KANBAN_COLUMNS } from '@/types/project';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { nanoid } from '@reduxjs/toolkit';
import { 
  Calendar, 
  Tag, 
  CheckSquare, 
  Plus, 
  X, 
  User, 
  Flag,
  AlertCircle
} from 'lucide-react';
import { addDays, format } from 'date-fns';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  defaultStatus?: TaskStatus;
  initialStatus?: TaskStatus;
  initialDueDate?: string;
}

const COMMON_TAGS = ['frontend', 'backend', 'design', 'bug', 'feature', 'marketing', 'docs', 'urgent'];

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  projectId,
  defaultStatus = 'todo',
  initialStatus,
  initialDueDate,
}) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(state => state.auth.currentUser);
  const users = useAppSelector(state => state.auth.users);
  const project = useAppSelector(state => state.projects.entities[projectId]);
  const columns = project?.kanbanColumns && project.kanbanColumns.length > 0 ? project.kanbanColumns : DEFAULT_KANBAN_COLUMNS;

  const targetStatus = initialStatus || defaultStatus;

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(targetStatus);
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeId, setAssigneeId] = useState<string | undefined>(currentUser?.id);
  const [dueDate, setDueDate] = useState<string>(initialDueDate || '');
  const [labels, setLabels] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  // Update status if defaultStatus or initialStatus changes while opening
  useEffect(() => {
    if (isOpen) {
      setStatus(targetStatus);
      if (initialDueDate) {
        setDueDate(initialDueDate);
      }
    }
  }, [isOpen, targetStatus, initialDueDate]);

  // Filter project members
  const projectMembers = users.filter(u => 
    project?.memberIds ? project.memberIds.includes(u.id) : true
  );

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus(defaultStatus);
    setPriority('medium');
    setAssigneeId(currentUser?.id);
    setDueDate('');
    setLabels([]);
    setCustomTagInput('');
    setSubtasks([]);
    setNewSubtaskTitle('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !labels.includes(trimmed)) {
      setLabels([...labels, trimmed]);
    }
    setCustomTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setLabels(labels.filter(t => t !== tag));
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      setSubtasks([...subtasks, newSubtaskTitle.trim()]);
      setNewSubtaskTitle('');
    }
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleQuickDueDate = (days: number) => {
    const target = addDays(new Date(), days);
    setDueDate(format(target, 'yyyy-MM-dd'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskId = nanoid();

    const formattedSubtasks: Subtask[] = subtasks.map(stTitle => ({
      id: nanoid(),
      taskId,
      title: stTitle,
      isCompleted: false,
    }));

    const newTask: Task = {
      id: taskId,
      projectId,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assigneeId: assigneeId || undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      labels,
      attachments: [],
      subtasks: formattedSubtasks,
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch(addTask(newTask));

    // Log creation activity
    if (currentUser) {
      dispatch(logActivity({
        id: nanoid(),
        taskId,
        projectId,
        actorId: currentUser.id,
        action: 'created',
        details: `Created task "${newTask.title}"`,
        createdAt: new Date().toISOString(),
      }));
    }

    handleClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Task"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            Task Title *
          </label>
          <input
            type="text"
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Implement authentication flow"
            className="w-full text-base font-medium rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add context, acceptance criteria, or technical details..."
            rows={3}
            className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
          />
        </div>

        {/* Grid for Status, Priority, Assignee, Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 flex items-center">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {columns.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 flex items-center">
              <Flag size={13} className="mr-1" /> Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 flex items-center">
              <User size={13} className="mr-1" /> Assignee
            </label>
            <select
              value={assigneeId || ''}
              onChange={(e) => setAssigneeId(e.target.value || undefined)}
              className="w-full text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Unassigned</option>
              {projectMembers.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 flex items-center">
              <Calendar size={13} className="mr-1" /> Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full text-sm rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-1.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center space-x-1.5 mt-1.5">
              <button
                type="button"
                onClick={() => handleQuickDueDate(0)}
                className="text-[11px] text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
              >
                Today
              </button>
              <span className="text-gray-300">·</span>
              <button
                type="button"
                onClick={() => handleQuickDueDate(1)}
                className="text-[11px] text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
              >
                Tomorrow
              </button>
              <span className="text-gray-300">·</span>
              <button
                type="button"
                onClick={() => handleQuickDueDate(7)}
                className="text-[11px] text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
              >
                +1 Week
              </button>
            </div>
          </div>
        </div>

        {/* Labels / Tags */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex items-center">
            <Tag size={13} className="mr-1.5" /> Tags & Labels
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {labels.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1.5 text-blue-400 hover:text-blue-600 dark:hover:text-blue-200"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={customTagInput}
              onChange={(e) => setCustomTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag(customTagInput);
                }
              }}
              placeholder="Add tag and press Enter..."
              className="flex-1 text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleAddTag(customTagInput)}
              disabled={!customTagInput.trim()}
            >
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            <span className="text-[11px] text-gray-400 mr-1">Suggestions:</span>
            {COMMON_TAGS.filter(t => !labels.includes(t)).slice(0, 5).map(suggested => (
              <button
                key={suggested}
                type="button"
                onClick={() => handleAddTag(suggested)}
                className="text-[11px] px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                +{suggested}
              </button>
            ))}
          </div>
        </div>

        {/* Initial Subtasks */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span className="flex items-center">
              <CheckSquare size={13} className="mr-1.5" /> Initial Subtasks ({subtasks.length})
            </span>
          </label>
          {subtasks.length > 0 && (
            <div className="space-y-1.5 mb-2 max-h-36 overflow-y-auto">
              {subtasks.map((st, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between px-3 py-1.5 rounded-md bg-gray-50 dark:bg-gray-900 text-xs text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-800"
                >
                  <span className="truncate">{idx + 1}. {st}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(idx)}
                    className="text-gray-400 hover:text-red-500 ml-2"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (newSubtaskTitle.trim()) {
                    setSubtasks([...subtasks, newSubtaskTitle.trim()]);
                    setNewSubtaskTitle('');
                  }
                }
              }}
              placeholder="Add a subtask..."
              className="flex-1 text-xs rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1.5 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddSubtask}
              disabled={!newSubtaskTitle.trim()}
            >
              Add Item
            </Button>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end space-x-3">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!title.trim()}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};

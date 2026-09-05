import React, { useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { bulkUpdateTasks, bulkRemoveTasks } from '@/lib/redux/slices/taskSlice';
import { clearTaskSelection } from '@/lib/redux/slices/uiSlice';
import { logActivity } from '@/lib/redux/slices/activitySlice';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { DEFAULT_KANBAN_COLUMNS, KanbanColumnDef } from '@/types/project';
import { Avatar } from '@/components/ui/Avatar';
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from '@/components/ui/Dropdown';
import { 
  CheckSquare, 
  Trash2, 
  X, 
  Flag, 
  UserCheck, 
  Layers, 
  AlertCircle,
  Check
} from 'lucide-react';
import { nanoid } from '@reduxjs/toolkit';

import { useUndoRedo } from '@/hooks/useUndoRedo';

interface BulkActionToolbarProps {
  projectId: string;
}

export const BulkActionToolbar: React.FC<BulkActionToolbarProps> = ({ projectId }) => {
  const dispatch = useAppDispatch();
  const selectedTaskIds = useAppSelector(state => state.ui.selectedTaskIds);
  const project = useAppSelector(state => state.projects.entities[projectId]);
  const tasks = useAppSelector(state => state.tasks.entities);
  const users = useAppSelector(state => state.auth.users);
  const currentUser = useAppSelector(state => state.auth.currentUser);
  const { trackAction } = useUndoRedo();

  const [confirmDelete, setConfirmDelete] = useState(false);

  const columns: KanbanColumnDef[] = useMemo(() => {
    if (project?.kanbanColumns && project.kanbanColumns.length > 0) {
      return project.kanbanColumns;
    }
    return DEFAULT_KANBAN_COLUMNS;
  }, [project?.kanbanColumns]);

  const projectMembers = useMemo(() => {
    if (!project?.memberIds) return users;
    return users.filter(u => project.memberIds.includes(u.id));
  }, [users, project?.memberIds]);

  if (selectedTaskIds.length === 0) {
    return null;
  }

  // Get snapshots of selected tasks
  const getSelectedTaskSnapshots = () => {
    return selectedTaskIds.map(id => tasks[id]).filter(Boolean) as Task[];
  };

  const handleBulkStatus = (status: TaskStatus, title: string) => {
    const prevTasks = getSelectedTaskSnapshots();
    const nextTasks = prevTasks.map(t => ({ ...t, status, updatedAt: new Date().toISOString() }));

    dispatch(bulkUpdateTasks({ ids: selectedTaskIds, changes: { status } }));
    trackAction({
      description: `Moved ${selectedTaskIds.length} tasks to ${title}`,
      previousTasks: prevTasks,
      nextTasks,
    });

    if (currentUser) {
      dispatch(logActivity({
        id: nanoid(),
        taskId: selectedTaskIds[0],
        projectId,
        actorId: currentUser.id,
        action: 'status_changed',
        details: `Moved ${selectedTaskIds.length} tasks to ${title}`,
        createdAt: new Date().toISOString(),
      }));
    }
  };

  const handleBulkPriority = (priority: TaskPriority) => {
    const prevTasks = getSelectedTaskSnapshots();
    const nextTasks = prevTasks.map(t => ({ ...t, priority, updatedAt: new Date().toISOString() }));

    dispatch(bulkUpdateTasks({ ids: selectedTaskIds, changes: { priority } }));
    trackAction({
      description: `Set priority of ${selectedTaskIds.length} tasks to ${priority}`,
      previousTasks: prevTasks,
      nextTasks,
    });

    if (currentUser) {
      dispatch(logActivity({
        id: nanoid(),
        taskId: selectedTaskIds[0],
        projectId,
        actorId: currentUser.id,
        action: 'priority_changed',
        details: `Set priority of ${selectedTaskIds.length} tasks to ${priority}`,
        createdAt: new Date().toISOString(),
      }));
    }
  };

  const handleBulkAssignee = (userId?: string, userName?: string) => {
    const prevTasks = getSelectedTaskSnapshots();
    const nextTasks = prevTasks.map(t => ({ ...t, assigneeId: userId, updatedAt: new Date().toISOString() }));

    dispatch(bulkUpdateTasks({ ids: selectedTaskIds, changes: { assigneeId: userId } }));
    trackAction({
      description: userId 
        ? `Assigned ${selectedTaskIds.length} tasks to ${userName}` 
        : `Unassigned ${selectedTaskIds.length} tasks`,
      previousTasks: prevTasks,
      nextTasks,
    });

    if (currentUser) {
      dispatch(logActivity({
        id: nanoid(),
        taskId: selectedTaskIds[0],
        projectId,
        actorId: currentUser.id,
        action: 'assigned',
        details: userId 
          ? `Assigned ${selectedTaskIds.length} tasks to ${userName}` 
          : `Unassigned ${selectedTaskIds.length} tasks`,
        createdAt: new Date().toISOString(),
      }));
    }
  };

  const handleBulkDelete = () => {
    const count = selectedTaskIds.length;
    const prevTasks = getSelectedTaskSnapshots();

    dispatch(bulkRemoveTasks(selectedTaskIds));
    dispatch(clearTaskSelection());
    setConfirmDelete(false);

    trackAction({
      description: `Deleted ${count} tasks`,
      previousTasks: prevTasks,
      nextTasks: [],
    });

    if (currentUser) {
      dispatch(logActivity({
        id: nanoid(),
        taskId: 'bulk',
        projectId,
        actorId: currentUser.id,
        action: 'deleted',
        details: `Deleted ${count} tasks in bulk`,
        createdAt: new Date().toISOString(),
      }));
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[95vw] sm:max-w-2xl animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="bg-gray-900/95 text-white dark:bg-gray-800/95 dark:text-gray-100 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-2xl border border-gray-700/60 flex items-center space-x-3 text-xs">
        {/* Count & Clear */}
        <div className="flex items-center space-x-2 pr-2 border-r border-gray-700">
          <div className="flex items-center space-x-1.5 font-medium">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">
              {selectedTaskIds.length}
            </span>
            <span className="hidden sm:inline">selected</span>
          </div>
          <button
            onClick={() => dispatch(clearTaskSelection())}
            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
            title="Clear selection"
          >
            <X size={14} />
          </button>
        </div>

        {/* Bulk Action Controls */}
        <div className="flex items-center space-x-1.5 flex-wrap">
          {/* Status Dropdown */}
          <Dropdown>
            <DropdownTrigger>
              <button className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 hover:text-white transition-colors">
                <Layers size={13} className="text-blue-400" />
                <span>Status</span>
              </button>
            </DropdownTrigger>
            <DropdownContent align="left" className="w-48">
              {columns.map(col => (
                <DropdownItem 
                  key={col.id} 
                  onClick={() => handleBulkStatus(col.id, col.title)}
                  className="flex items-center space-x-2"
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color || '#64748b' }} />
                  <span>{col.title}</span>
                </DropdownItem>
              ))}
            </DropdownContent>
          </Dropdown>

          {/* Priority Dropdown */}
          <Dropdown>
            <DropdownTrigger>
              <button className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 hover:text-white transition-colors">
                <Flag size={13} className="text-amber-400" />
                <span>Priority</span>
              </button>
            </DropdownTrigger>
            <DropdownContent align="left" className="w-40">
              <DropdownItem onClick={() => handleBulkPriority('urgent')} className="flex items-center space-x-2 text-red-600 dark:text-red-400">
                <Flag size={13} />
                <span>Urgent</span>
              </DropdownItem>
              <DropdownItem onClick={() => handleBulkPriority('high')} className="flex items-center space-x-2 text-orange-600 dark:text-orange-400">
                <Flag size={13} />
                <span>High</span>
              </DropdownItem>
              <DropdownItem onClick={() => handleBulkPriority('medium')} className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                <Flag size={13} />
                <span>Medium</span>
              </DropdownItem>
              <DropdownItem onClick={() => handleBulkPriority('low')} className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                <Flag size={13} />
                <span>Low</span>
              </DropdownItem>
            </DropdownContent>
          </Dropdown>

          {/* Assignee Dropdown */}
          <Dropdown>
            <DropdownTrigger>
              <button className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-200 hover:text-white transition-colors">
                <UserCheck size={13} className="text-emerald-400" />
                <span>Assign</span>
              </button>
            </DropdownTrigger>
            <DropdownContent align="left" className="w-52 max-h-60 overflow-y-auto">
              <DropdownItem 
                onClick={() => handleBulkAssignee(undefined)}
                className="text-gray-500 italic"
              >
                Unassigned (Remove Assignee)
              </DropdownItem>
              {projectMembers.map(user => (
                <DropdownItem 
                  key={user.id} 
                  onClick={() => handleBulkAssignee(user.id, user.name)}
                  className="flex items-center space-x-2"
                >
                  <Avatar name={user.name} src={user.avatar} size="xs" />
                  <span className="truncate">{user.name}</span>
                </DropdownItem>
              ))}
            </DropdownContent>
          </Dropdown>

          {/* Delete Action with Confirmation */}
          {confirmDelete ? (
            <div className="flex items-center space-x-1 bg-red-950/80 border border-red-800 px-2 py-1 rounded-lg">
              <span className="text-[11px] text-red-200 font-medium">Delete {selectedTaskIds.length}?</span>
              <button
                onClick={handleBulkDelete}
                className="p-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                title="Confirm delete"
              >
                <Check size={12} />
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="p-1 text-gray-300 hover:text-white rounded transition-colors"
                title="Cancel"
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-red-900/40 hover:bg-red-900/70 border border-red-800/60 text-red-300 hover:text-red-100 transition-colors"
              title="Delete selected tasks"
            >
              <Trash2 size={13} />
              <span className="hidden sm:inline">Delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

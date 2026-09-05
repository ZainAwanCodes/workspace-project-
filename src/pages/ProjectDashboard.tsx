import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { setActiveViewMode } from '@/lib/redux/slices/uiSlice';
import { updateProject } from '@/lib/redux/slices/projectSlice';
import { UserPlus, Layout, ShieldAlert, Archive, RotateCcw } from 'lucide-react';
import { KanbanBoard } from '@/components/views/Kanban/KanbanBoard';
import { ListView } from '@/components/views/List/ListView';
import { CalendarView } from '@/components/views/Calendar/CalendarView';
import { TaskDetailDrawer } from '@/components/tasks/TaskDetailDrawer';
import { FilterBar } from '@/components/filtering/FilterBar';
import { DynamicIcon } from '@/utils/iconMap';

import { ProjectSettingsModal } from '@/components/settings/ProjectSettingsModal';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { BulkActionToolbar } from '@/components/tasks/BulkActionToolbar';
import { Settings } from 'lucide-react';
import { useCurrentRole, useHasPermission } from '@/lib/redux/usePermissions';
import { Tooltip } from '@/components/ui/Tooltip';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export default function ProjectDashboard() {
  const { projectId } = useParams();
  const dispatch = useAppDispatch();
  
  const project = useAppSelector(state => 
    projectId ? state.projects.entities[projectId] : null
  );
  
  const activeViewMode = useAppSelector(state => state.ui.activeViewMode);
  const users = useAppSelector(state => state.auth.users);
  const currentUser = useAppSelector(state => state.auth.currentUser);

  const role = useCurrentRole();
  const canManageProject = useHasPermission(['owner', 'admin']);
  const canCreateTask = useHasPermission(['owner', 'admin', 'member']);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  // New Task State
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Shortcut: C to open Create Task Modal
  useKeyboardShortcuts([
    {
      combo: { key: 'c' },
      callback: () => {
        if (canCreateTask && !project?.isArchived) {
          setIsNewTaskModalOpen(true);
        }
      }
    }
  ]);

  const handleUnarchive = () => {
    if (!project) return;
    dispatch(updateProject({
      id: project.id,
      changes: { isArchived: false }
    }));
  };

  if (!project) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full">
        <Layout size={48} className="text-gray-300 dark:text-gray-700 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Project not found</h2>
        <p className="text-gray-500 dark:text-gray-400">The project you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Archived Notice Banner */}
      {project.isArchived && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center space-x-2">
            <Archive size={14} />
            <span>This project is currently archived. It is hidden from standard navigation.</span>
          </div>
          <button
            onClick={handleUnarchive}
            className="font-medium underline hover:text-amber-950 dark:hover:text-amber-200 flex items-center space-x-1"
          >
            <RotateCcw size={12} className="mr-1" />
            Unarchive Project
          </button>
        </div>
      )}

      {/* Project Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm shadow-xs flex-shrink-0" 
              style={{ backgroundColor: project.color || '#3b82f6' }} 
            >
              <DynamicIcon name={project.icon || 'layout'} size={18} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center">
                {project.name}
                {project.isArchived && (
                  <span className="ml-2.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Archived
                  </span>
                )}
              </h1>
              {project.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-xl truncate">
                  {project.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Project Members */}
            <div className="flex items-center">
              <div 
                className="flex -space-x-2 mr-3 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setIsSettingsModalOpen(true)}
                title="Manage Project Members"
              >
                {project.memberIds.map(id => {
                  const user = users.find(u => u.id === id);
                  return user ? (
                    <Avatar key={id} name={user.name} src={user.avatar} size="sm" className="ring-2 ring-white dark:ring-gray-900" />
                  ) : null;
                })}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full h-8 px-3 text-xs"
                onClick={() => setIsSettingsModalOpen(true)}
              >
                <UserPlus size={14} className="mr-1.5" /> Members ({project.memberIds.length})
              </Button>
            </div>
            
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-800" />
            
            {canManageProject && (
              <Button variant="ghost" size="icon" onClick={() => setIsSettingsModalOpen(true)} title="Project Settings">
                <Settings size={18} />
              </Button>
            )}
          </div>
        </div>

        {/* View Tabs & Filters */}
        <div className="flex items-center justify-between">
          <Tabs 
            defaultValue={activeViewMode} 
            value={activeViewMode}
            onValueChange={(val) => dispatch(setActiveViewMode(val as 'kanban' | 'list' | 'calendar'))}
            className="w-auto"
          >
            <TabsList className="mb-0 border-none space-x-1.5">
              <TabsTrigger value="kanban" className="flex items-center space-x-1.5">
                <span>Board</span>
                <kbd className="hidden md:inline-block px-1 py-0.2 text-[9px] font-sans font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded">1</kbd>
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center space-x-1.5">
                <span>List</span>
                <kbd className="hidden md:inline-block px-1 py-0.2 text-[9px] font-sans font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded">2</kbd>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center space-x-1.5">
                <span>Calendar</span>
                <kbd className="hidden md:inline-block px-1 py-0.2 text-[9px] font-sans font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded">3</kbd>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center space-x-2">
            <FilterBar />
            {canCreateTask ? (
              <Button size="sm" onClick={() => setIsNewTaskModalOpen(true)} className="flex items-center space-x-1.5 shadow-xs">
                <span>New Task</span>
                <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-sans font-semibold bg-blue-700/60 text-blue-100 rounded">C</kbd>
              </Button>
            ) : (
              <Tooltip side="bottom" content="You do not have permission to create tasks.">
                <div>
                  <Button disabled size="sm" className="opacity-60 cursor-not-allowed">
                    <ShieldAlert size={14} className="mr-1.5 text-white/70" /> New Task
                  </Button>
                </div>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      {/* Main Board/View Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        {activeViewMode === 'kanban' && (
          <KanbanBoard projectId={project.id} />
        )}
        {activeViewMode === 'list' && (
          <ListView projectId={project.id} onTaskClick={(id) => setSelectedTaskId(id)} />
        )}
        {activeViewMode === 'calendar' && (
          <CalendarView projectId={project.id} onTaskClick={(id) => setSelectedTaskId(id)} />
        )}
      </div>

      {/* Task Detail Drawer for List and Calendar views (Kanban handles its own) */}
      {activeViewMode !== 'kanban' && (
        <TaskDetailDrawer 
          taskId={selectedTaskId} 
          onClose={() => setSelectedTaskId(null)} 
        />
      )}

      {/* New Task Modal */}
      <CreateTaskModal 
        isOpen={isNewTaskModalOpen} 
        onClose={() => setIsNewTaskModalOpen(false)} 
        projectId={project.id} 
      />

      <ProjectSettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        projectId={project.id}
      />

      {/* Floating Multi-Select Bulk Action Toolbar */}
      <BulkActionToolbar projectId={project.id} />
    </div>
  );
}

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { setActiveViewMode } from '@/lib/redux/slices/uiSlice';
import { UserPlus, MoreHorizontal, Layout } from 'lucide-react';
import { KanbanBoard } from '@/components/views/Kanban/KanbanBoard';
import { ListView } from '@/components/views/List/ListView';
import { CalendarView } from '@/components/views/Calendar/CalendarView';
import { TaskDetailDrawer } from '@/components/tasks/TaskDetailDrawer';
import { FilterBar } from '@/components/filtering/FilterBar';

export default function ProjectDashboard() {
  const { projectId } = useParams();
  const dispatch = useAppDispatch();
  
  const project = useAppSelector(state => 
    projectId ? state.projects.entities[projectId] : null
  );
  
  const activeViewMode = useAppSelector(state => state.ui.activeViewMode);
  const users = useAppSelector(state => state.auth.users);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

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
      {/* Project Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div 
              className="w-4 h-4 rounded-sm flex-shrink-0" 
              style={{ backgroundColor: project.color || '#3b82f6' }} 
            />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{project.name}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Project Members */}
            <div className="flex items-center">
              <div className="flex -space-x-2 mr-3">
                {project.memberIds.map(id => {
                  const user = users.find(u => u.id === id);
                  return user ? (
                    <Avatar key={id} name={user.name} src={user.avatar} size="sm" className="ring-2 ring-white dark:ring-gray-900" />
                  ) : null;
                })}
              </div>
              <Button variant="outline" size="sm" className="rounded-full h-8 px-3 text-xs">
                <UserPlus size={14} className="mr-1.5" /> Share
              </Button>
            </div>
            
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-800" />
            
            <Button variant="ghost" size="icon">
              <MoreHorizontal size={18} />
            </Button>
          </div>
        </div>

        {/* View Tabs & Filters */}
        <div className="flex items-center justify-between">
          <Tabs 
            defaultValue={activeViewMode} 
            onValueChange={(val) => dispatch(setActiveViewMode(val as 'kanban' | 'list' | 'calendar'))}
            className="w-auto"
          >
            <TabsList className="mb-0 border-none space-x-2">
              <TabsTrigger value="kanban">
                Board
              </TabsTrigger>
              <TabsTrigger value="list">
                List
              </TabsTrigger>
              <TabsTrigger value="calendar">
                Calendar
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center space-x-2">
            <FilterBar />
            <Button size="sm">
              New Task
            </Button>
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
    </div>
  );
}

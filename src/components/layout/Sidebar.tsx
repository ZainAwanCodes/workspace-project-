import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { setActiveProject } from '@/lib/redux/slices/projectSlice';
import { setActiveViewMode, toggleTheme, setSidebarOpen } from '@/lib/redux/slices/uiSlice';
import { 
  Briefcase, Kanban, List as ListIcon, Calendar, 
  Moon, Sun, ChevronDown, ChevronRight, X 
} from 'lucide-react';

export const Sidebar = () => {
  const dispatch = useAppDispatch();
  
  // UI State
  const { sidebarOpen, activeViewMode, theme } = useAppSelector(state => state.ui);
  
  // Workspace State
  const workspaces = useAppSelector(state => state.workspaces.ids.map(id => state.workspaces.entities[id]!));
  const activeWorkspaceId = useAppSelector(state => state.workspaces.activeWorkspaceId);
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
  
  // Project State
  const projects = useAppSelector(state => state.projects.ids.map(id => state.projects.entities[id]!));
  const activeProjectId = useAppSelector(state => state.projects.activeProjectId);
  
  // Local Component State
  const [projectsExpanded, setProjectsExpanded] = useState(true);

  if (!sidebarOpen) return null;

  return (
    <aside className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex flex-col h-full transition-all duration-300">
      {/* Workspace Header Component */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <div className="flex items-center space-x-3 text-gray-900 dark:text-white font-semibold overflow-hidden">
          <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
            <Briefcase size={16} />
          </div>
          <span className="truncate">{activeWorkspace?.name || 'Select Workspace'}</span>
        </div>
        <button 
          className="md:hidden text-gray-500 hover:text-gray-900 dark:hover:text-white" 
          onClick={(e) => {
            e.stopPropagation();
            dispatch(setSidebarOpen(false));
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Navigation Area */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        
        {/* Core Views Toggles */}
        <div>
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">Views</div>
          <div className="space-y-1">
            <ViewButton 
              icon={<Kanban size={18} />} 
              label="Kanban Board" 
              isActive={activeViewMode === 'kanban'} 
              onClick={() => dispatch(setActiveViewMode('kanban'))} 
            />
            <ViewButton 
              icon={<ListIcon size={18} />} 
              label="List View" 
              isActive={activeViewMode === 'list'} 
              onClick={() => dispatch(setActiveViewMode('list'))} 
            />
            <ViewButton 
              icon={<Calendar size={18} />} 
              label="Calendar" 
              isActive={activeViewMode === 'calendar'} 
              onClick={() => dispatch(setActiveViewMode('calendar'))} 
            />
          </div>
        </div>

        {/* Collapsible Project List */}
        <div>
          <div 
            className="flex items-center justify-between px-2 cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-1 transition-colors"
            onClick={() => setProjectsExpanded(!projectsExpanded)}
          >
            <span className="text-xs font-semibold uppercase tracking-wider">Projects</span>
            {projectsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
          
          {projectsExpanded && (
            <div className="space-y-1 mt-2">
              {projects
                .filter(p => p.workspaceId === activeWorkspaceId && !p.isArchived)
                .map(project => (
                  <button
                    key={project.id}
                    onClick={() => dispatch(setActiveProject(project.id))}
                    className={`w-full flex items-center space-x-3 px-2 py-1.5 rounded-md text-sm transition-colors ${
                      activeProjectId === project.id 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 font-medium' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div 
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm" 
                      style={{ backgroundColor: project.color || '#9ca3af' }} 
                    />
                    <span className="truncate">{project.name}</span>
                  </button>
              ))}
              
              {/* Empty state for no projects */}
              {projects.filter(p => p.workspaceId === activeWorkspaceId && !p.isArchived).length === 0 && (
                <div className="px-2 py-2 text-sm text-gray-400 dark:text-gray-500 italic">
                  No active projects
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Area (Settings & Theme) */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <button 
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        {/* Placeholder for workspace settings link */}
        <div className="text-xs text-gray-400 dark:text-gray-500 font-medium px-2 cursor-pointer hover:text-gray-900 dark:hover:text-gray-300">
          Settings
        </div>
      </div>
    </aside>
  );
};

// Reusable Navigation Button Component
const ViewButton = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-2 py-2 rounded-md text-sm transition-colors ${
      isActive 
        ? 'bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-white font-medium shadow-sm' 
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
    }`}
  >
    <div className={`${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
      {icon}
    </div>
    <span>{label}</span>
  </button>
);

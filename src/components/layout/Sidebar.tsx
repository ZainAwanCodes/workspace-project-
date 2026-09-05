import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { setActiveProject } from '@/lib/redux/slices/projectSlice';
import { setActiveWorkspace } from '@/lib/redux/slices/workspaceSlice';
import { setActiveViewMode, toggleTheme, setSidebarOpen } from '@/lib/redux/slices/uiSlice';
import { 
  Kanban, List as ListIcon, Calendar, 
  Moon, Sun, ChevronDown, ChevronRight, X, Check, 
  Plus, Settings
} from 'lucide-react';
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from '../ui/Dropdown';
import { useNavigate } from 'react-router-dom';
import { DynamicIcon } from '@/utils/iconMap';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';
import { CreateProjectModal } from '../settings/CreateProjectModal';
import { WorkspaceSettingsModal } from '../settings/WorkspaceSettingsModal';

export const Sidebar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
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
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isWorkspaceSettingsOpen, setIsWorkspaceSettingsOpen] = useState(false);

  const handleWorkspaceSwitch = (workspaceId: string) => {
    dispatch(setActiveWorkspace(workspaceId));
    navigate(`/w/${workspaceId}`);
  };

  const handleProjectSwitch = (projectId: string) => {
    dispatch(setActiveProject(projectId));
    navigate(`/w/${activeWorkspaceId}/p/${projectId}`);
  };

  if (!sidebarOpen) return null;

  return (
    <>
      <aside className="w-64 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex flex-col h-full transition-all duration-300">
        {/* Workspace Header Component */}
        <div className="h-14 flex items-center justify-between px-3 border-b border-gray-200 dark:border-gray-800 transition-colors">
          <Dropdown className="flex-1 w-full truncate">
            <DropdownTrigger className="w-full flex items-center space-x-2.5 text-gray-900 dark:text-white font-semibold overflow-hidden hover:bg-gray-200 dark:hover:bg-gray-800 px-2 py-1.5 rounded-lg transition-colors">
              <div 
                className="w-6 h-6 rounded-md flex items-center justify-center text-white flex-shrink-0 shadow-2xs"
                style={{ backgroundColor: activeWorkspace?.color || '#3b82f6' }}
              >
                <DynamicIcon name={activeWorkspace?.icon || 'briefcase'} size={14} />
              </div>
              <span className="truncate text-sm flex-1 text-left">{activeWorkspace?.name || 'Select Workspace'}</span>
              <ChevronDown size={14} className="text-gray-400" />
            </DropdownTrigger>
            
            <DropdownContent align="left" className="w-60 mt-1 ml-1">
              <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Workspaces
              </div>
              
              {workspaces.map(w => (
                <DropdownItem 
                  key={w.id} 
                  onClick={() => handleWorkspaceSwitch(w.id)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <div 
                      className="w-5 h-5 rounded-md flex items-center justify-center text-white text-xs flex-shrink-0"
                      style={{ backgroundColor: w.color || '#3b82f6' }}
                    >
                      <DynamicIcon name={w.icon || 'briefcase'} size={12} />
                    </div>
                    <span className="truncate text-sm">{w.name}</span>
                  </div>
                  {activeWorkspaceId === w.id && <Check size={14} className="text-blue-500 flex-shrink-0 ml-2" />}
                </DropdownItem>
              ))}

              <div className="border-t border-gray-100 dark:border-gray-800 my-1 pt-1">
                <DropdownItem 
                  onClick={() => setIsCreateWorkspaceOpen(true)}
                  className="text-blue-600 dark:text-blue-400 font-medium flex items-center space-x-2"
                >
                  <Plus size={15} />
                  <span>Create Workspace</span>
                </DropdownItem>
                {activeWorkspace && (
                  <DropdownItem 
                    onClick={() => setIsWorkspaceSettingsOpen(true)}
                    className="flex items-center space-x-2 text-gray-600 dark:text-gray-300"
                  >
                    <Settings size={15} />
                    <span>Workspace Settings</span>
                  </DropdownItem>
                )}
              </div>
            </DropdownContent>
          </Dropdown>

          <button 
            className="md:hidden text-gray-500 hover:text-gray-900 dark:hover:text-white ml-2 p-1" 
            onClick={(e) => {
              e.stopPropagation();
              dispatch(setSidebarOpen(false));
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Main Navigation Area */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          
          {/* Core Views Toggles */}
          <div>
            <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-2">Views</div>
            <div className="space-y-1">
              <ViewButton 
                icon={<Kanban size={17} />} 
                label="Kanban Board" 
                isActive={activeViewMode === 'kanban'} 
                onClick={() => dispatch(setActiveViewMode('kanban'))} 
              />
              <ViewButton 
                icon={<ListIcon size={17} />} 
                label="List View" 
                isActive={activeViewMode === 'list'} 
                onClick={() => dispatch(setActiveViewMode('list'))} 
              />
              <ViewButton 
                icon={<Calendar size={17} />} 
                label="Calendar" 
                isActive={activeViewMode === 'calendar'} 
                onClick={() => dispatch(setActiveViewMode('calendar'))} 
              />
            </div>
          </div>

          {/* Collapsible Project List */}
          <div>
            <div className="flex items-center justify-between px-2 text-gray-500 dark:text-gray-400 mb-1.5">
              <div 
                className="flex items-center space-x-1.5 cursor-pointer hover:text-gray-900 dark:hover:text-gray-200 transition-colors flex-1"
                onClick={() => setProjectsExpanded(!projectsExpanded)}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider">Projects</span>
                {projectsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>

              {activeWorkspaceId && (
                <button
                  type="button"
                  onClick={() => setIsCreateProjectOpen(true)}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                  title="Create Project"
                >
                  <Plus size={14} />
                </button>
              )}
            </div>
            
            {projectsExpanded && (
              <div className="space-y-1 mt-1">
                {projects
                  .filter(p => p.workspaceId === activeWorkspaceId && !p.isArchived)
                  .map(project => (
                    <button
                      key={project.id}
                      onClick={() => handleProjectSwitch(project.id)}
                      className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                        activeProjectId === project.id 
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-medium' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800'
                      }`}
                    >
                      <div 
                        className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px] flex-shrink-0"
                        style={{ backgroundColor: project.color || '#9ca3af' }}
                      >
                        <DynamicIcon name={project.icon || 'layout'} size={12} />
                      </div>
                      <span className="truncate flex-1 text-left">{project.name}</span>
                    </button>
                ))}
                
                {/* Empty state for no projects */}
                {projects.filter(p => p.workspaceId === activeWorkspaceId && !p.isArchived).length === 0 && (
                  <div className="px-2 py-3 text-xs text-gray-400 dark:text-gray-500 italic flex flex-col items-start space-y-1">
                    <span>No active projects</span>
                    <button
                      onClick={() => setIsCreateProjectOpen(true)}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium not-italic"
                    >
                      + Create first project
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer Area (Settings & Theme) */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <button 
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center justify-center"
            aria-label="Toggle Theme"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <button 
            onClick={() => setIsWorkspaceSettingsOpen(true)}
            className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors flex items-center space-x-1.5"
          >
            <Settings size={14} />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Modals */}
      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceOpen}
        onClose={() => setIsCreateWorkspaceOpen(false)}
      />

      {activeWorkspaceId && (
        <CreateProjectModal
          isOpen={isCreateProjectOpen}
          onClose={() => setIsCreateProjectOpen(false)}
          workspaceId={activeWorkspaceId}
        />
      )}

      <WorkspaceSettingsModal
        isOpen={isWorkspaceSettingsOpen}
        onClose={() => setIsWorkspaceSettingsOpen(false)}
      />
    </>
  );
};

// Reusable Navigation Button Component
const ViewButton = ({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors ${
      isActive 
        ? 'bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-white font-medium shadow-2xs' 
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/70 dark:hover:bg-gray-800/70'
    }`}
  >
    <div className={`${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
      {icon}
    </div>
    <span className="truncate">{label}</span>
  </button>
);

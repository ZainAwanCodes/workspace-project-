import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { setActiveProject } from '@/lib/redux/slices/projectSlice';
import { setActiveWorkspace } from '@/lib/redux/slices/workspaceSlice';
import { setActiveViewMode, toggleTheme, setSidebarOpen } from '@/lib/redux/slices/uiSlice';
import {
  Kanban, List as ListIcon, Calendar,
  Moon, Sun, ChevronDown, ChevronRight, X, Check,
  Plus, Settings, ArrowLeft, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from '../ui/Dropdown';
import { useNavigate } from 'react-router-dom';
import { DynamicIcon } from '@/utils/iconMap';
import { CreateWorkspaceModal } from './CreateWorkspaceModal';
import { DeleteWorkspaceModal } from './DeleteWorkspaceModal';
import { CreateProjectModal } from '../settings/CreateProjectModal';
import { WorkspaceSettingsModal } from '../settings/WorkspaceSettingsModal';
import { Workspace } from '@/types/workspace';

export const Sidebar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { sidebarOpen, activeViewMode, theme } = useAppSelector(state => state.ui);

  const workspaces = useAppSelector(state => state.workspaces.ids.map(id => state.workspaces.entities[id]!));
  const activeWorkspaceId = useAppSelector(state => state.workspaces.activeWorkspaceId);
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);

  const projects = useAppSelector(state => state.projects.ids.map(id => state.projects.entities[id]!));
  const activeProjectId = useAppSelector(state => state.projects.activeProjectId);

  const [projectsExpanded, setProjectsExpanded] = useState(true);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isWorkspaceSettingsOpen, setIsWorkspaceSettingsOpen] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(null);

  const closeOnMobile = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      dispatch(setSidebarOpen(false));
    }
  };

  const handleWorkspaceSwitch = (workspaceId: string) => {
    dispatch(setActiveWorkspace(workspaceId));
    navigate(`/w/${workspaceId}`);
    closeOnMobile();
  };

  const handleProjectSwitch = (projectId: string) => {
    dispatch(setActiveProject(projectId));
    navigate(`/w/${activeWorkspaceId}/p/${projectId}`);
    closeOnMobile();
  };

  if (!sidebarOpen) return null;

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className="md:hidden fixed inset-0 z-40 backdrop-blur-sm transition-opacity"
        style={{ background: 'rgba(15, 15, 17, 0.55)' }}
        onClick={() => dispatch(setSidebarOpen(false))}
        aria-hidden="true"
      />

      <aside
        className="fixed md:relative inset-y-0 left-0 z-50 md:z-auto w-64 max-w-[85vw] flex-shrink-0 flex flex-col h-full shadow-2xl md:shadow-none transition-all duration-300"
        style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
      >
        {/* Workspace Header */}
        <div
          className="h-14 flex items-center justify-between px-3 transition-colors"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <Dropdown className="flex-1 w-full truncate">
            <DropdownTrigger className="w-full flex items-center space-x-2.5 font-semibold overflow-hidden px-2 py-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-primary)' }}>
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-white flex-shrink-0 shadow-sm"
                style={{ backgroundColor: activeWorkspace?.color || 'var(--accent)' }}
              >
                <DynamicIcon name={activeWorkspace?.icon || 'briefcase'} size={14} />
              </div>
              <span className="truncate text-sm flex-1 text-left">{activeWorkspace?.name || 'Select Workspace'}</span>
              <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
            </DropdownTrigger>

            <DropdownContent align="left" className="w-60 mt-1 ml-1">
              <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Workspaces
              </div>

              {workspaces.map(w => (
                <DropdownItem
                  key={w.id}
                  onClick={() => handleWorkspaceSwitch(w.id)}
                  className="flex items-center justify-between group/ws"
                >
                  <div className="flex items-center space-x-2.5 truncate flex-1 min-w-0">
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center text-white text-xs flex-shrink-0"
                      style={{ backgroundColor: w.color || 'var(--accent)' }}
                    >
                      <DynamicIcon name={w.icon || 'briefcase'} size={12} />
                    </div>
                    <span className="truncate text-sm">{w.name}</span>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                    {activeWorkspaceId === w.id && <Check size={14} style={{ color: 'var(--accent)' }} />}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setWorkspaceToDelete(w);
                      }}
                      className="p-1 rounded opacity-0 group-hover/ws:opacity-100 hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-all"
                      title="Delete Workspace"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </DropdownItem>
              ))}

              <div className="my-1 pt-1" style={{ borderTop: '1px solid var(--border)' }}>
                <DropdownItem
                  onClick={() => setIsCreateWorkspaceOpen(true)}
                  className="flex items-center space-x-2 font-medium"
                  style={{ color: 'var(--accent)' }}
                >
                  <Plus size={15} />
                  <span>Create Workspace</span>
                </DropdownItem>
                {activeWorkspace && (
                  <DropdownItem
                    onClick={() => setIsWorkspaceSettingsOpen(true)}
                    className="flex items-center space-x-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <Settings size={15} />
                    <span>Workspace Settings</span>
                  </DropdownItem>
                )}
              </div>
            </DropdownContent>
          </Dropdown>

          <button
            className="md:hidden p-1 ml-2 rounded-md transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onClick={(e) => { e.stopPropagation(); dispatch(setSidebarOpen(false)); }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">

          {/* Views */}
          <div>
            <div
              className="text-[11px] font-semibold uppercase tracking-wider mb-2 px-2"
              style={{ color: 'var(--text-muted)' }}
            >
              Views
            </div>
            <div className="space-y-0.5">
              <ViewButton
                icon={<Kanban size={17} />}
                label="Kanban Board"
                isActive={activeViewMode === 'kanban'}
                onClick={() => { dispatch(setActiveViewMode('kanban')); closeOnMobile(); }}
              />
              <ViewButton
                icon={<ListIcon size={17} />}
                label="List View"
                isActive={activeViewMode === 'list'}
                onClick={() => { dispatch(setActiveViewMode('list')); closeOnMobile(); }}
              />
              <ViewButton
                icon={<Calendar size={17} />}
                label="Calendar"
                isActive={activeViewMode === 'calendar'}
                onClick={() => { dispatch(setActiveViewMode('calendar')); closeOnMobile(); }}
              />
            </div>
          </div>

          {/* Projects */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5" style={{ color: 'var(--text-muted)' }}>
              <div
                className="flex items-center space-x-1.5 cursor-pointer flex-1 transition-colors"
                onClick={() => setProjectsExpanded(!projectsExpanded)}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider">Projects</span>
                {projectsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>

              {activeWorkspaceId && (
                <button
                  type="button"
                  onClick={() => setIsCreateProjectOpen(true)}
                  className="p-1 rounded transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  title="Create Project"
                >
                  <Plus size={14} />
                </button>
              )}
            </div>

            <AnimatePresence initial={false}>
              {projectsExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="space-y-0.5 mt-1">
                    {projects
                      .filter(p => p.workspaceId === activeWorkspaceId && !p.isArchived)
                      .map(project => (
                        <button
                          key={project.id}
                          onClick={() => handleProjectSwitch(project.id)}
                          className="w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors"
                          style={
                            activeProjectId === project.id
                              ? { background: 'var(--accent-muted)', color: 'var(--accent-muted-fg)', fontWeight: 500 }
                              : { color: 'var(--text-secondary)' }
                          }
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

                    {projects.filter(p => p.workspaceId === activeWorkspaceId && !p.isArchived).length === 0 && (
                      <div className="px-2 py-3 text-xs italic flex flex-col items-start space-y-1" style={{ color: 'var(--text-muted)' }}>
                        <span>No active projects</span>
                        <button
                          onClick={() => setIsCreateProjectOpen(true)}
                          className="font-medium not-italic transition-colors"
                          style={{ color: 'var(--accent)' }}
                        >
                          + Create first project
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Back to Website Button */}
        <div className="px-3 pb-2">
          <button
            onClick={() => {
              navigate('/');
              closeOnMobile();
            }}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all group"
            style={{
              color: 'var(--text-secondary)',
              background: 'var(--surface-raised)',
              border: '1px solid var(--border)',
            }}
            title="Return to website landing page"
          >
            <div className="flex items-center space-x-2">
              <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Website</span>
            </div>
            <span className="text-[10px] opacity-60">Home</span>
          </button>
        </div>

        {/* Footer: Theme Toggle + Settings */}
        <div className="p-3 flex items-center justify-between" style={{ borderTop: '1px solid var(--border)' }}>
          <motion.button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-lg transition-colors flex items-center justify-center"
            style={{ color: 'var(--text-secondary)' }}
            whileHover={{ scale: 1.08, background: 'var(--surface-raised)' }}
            whileTap={{ scale: 0.92 }}
            aria-label="Toggle Theme"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === 'dark' ? (
                <motion.span
                  key="sun"
                  initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <Sun size={18} />
                </motion.span>
              ) : (
                <motion.span
                  key="moon"
                  initial={{ rotate: 90, opacity: 0, scale: 0.7 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: -90, opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <Moon size={18} />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          <button
            onClick={() => setIsWorkspaceSettingsOpen(true)}
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Settings size={14} />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Modals */}
      <CreateWorkspaceModal isOpen={isCreateWorkspaceOpen} onClose={() => setIsCreateWorkspaceOpen(false)} />

      {activeWorkspaceId && (
        <CreateProjectModal
          isOpen={isCreateProjectOpen}
          onClose={() => setIsCreateProjectOpen(false)}
          workspaceId={activeWorkspaceId}
        />
      )}

      <WorkspaceSettingsModal isOpen={isWorkspaceSettingsOpen} onClose={() => setIsWorkspaceSettingsOpen(false)} />

      <DeleteWorkspaceModal
        workspace={workspaceToDelete}
        isOpen={!!workspaceToDelete}
        onClose={() => setWorkspaceToDelete(null)}
      />
    </>
  );
};

// Reusable Navigation Button
const ViewButton = ({ icon, label, isActive, onClick }: { icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors"
    style={
      isActive
        ? { background: 'var(--accent-muted)', color: 'var(--accent-muted-fg)', fontWeight: 500 }
        : { color: 'var(--text-secondary)' }
    }
  >
    <div style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}>
      {icon}
    </div>
    <span className="truncate">{label}</span>
  </button>
);

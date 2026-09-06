import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/lib/redux/hooks';
import { useCurrentRole, useHasPermission } from '@/lib/redux/usePermissions';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Plus, Layout, Users, Settings, ShieldAlert, Archive, ArrowLeft, ExternalLink, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { WorkspaceSettingsModal } from '@/components/settings/WorkspaceSettingsModal';
import { CreateProjectModal } from '@/components/settings/CreateProjectModal';
import { DeleteWorkspaceModal } from '@/components/layout/DeleteWorkspaceModal';
import { CreateWorkspaceModal } from '@/components/layout/CreateWorkspaceModal';
import { Tooltip } from '@/components/ui/Tooltip';
import { DynamicIcon } from '@/utils/iconMap';

export default function WorkspaceDashboard() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const workspace = useAppSelector(state =>
    workspaceId ? state.workspaces.entities[workspaceId] : null
  );

  const allProjects = useAppSelector(state =>
    state.projects.ids
      .map(id => state.projects.entities[id]!)
      .filter(p => p.workspaceId === workspaceId)
  );

  const activeProjects = allProjects.filter(p => !p.isArchived);
  const archivedProjects = allProjects.filter(p => p.isArchived);

  const users = useAppSelector(state => state.auth.users);

  const role = useCurrentRole();
  const canManageWorkspace = useHasPermission(['owner', 'admin']);
  const canCreateProject = useHasPermission(['owner', 'admin', 'member']);

  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  if (!workspace) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full">
        <DynamicIcon name="briefcase" size={48} className="text-gray-300 dark:text-gray-700 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Workspace not found</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">The workspace you are looking for does not exist or you do not have permission to view it.</p>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft size={15} className="mr-1.5" /> Go Back
          </Button>
          <Button onClick={() => setIsCreateWorkspaceModalOpen(true)}>
            <Plus size={15} className="mr-1.5" /> Create Workspace
          </Button>
        </div>
        <CreateWorkspaceModal
          isOpen={isCreateWorkspaceModalOpen}
          onClose={() => setIsCreateWorkspaceModalOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Workspace Header */}
      <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-4 py-4 sm:px-8 sm:py-6 flex-shrink-0">
        <div className="max-w-5xl mx-auto">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between gap-2 mb-4 pb-2.5 border-b border-gray-100 dark:border-gray-800/60">
            <button
              onClick={() => {
                if (window.history.state && window.history.state.idx > 0) {
                  navigate(-1);
                } else {
                  navigate('/');
                }
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all group hover:bg-gray-100 dark:hover:bg-gray-800"
              style={{
                background: 'var(--surface-raised)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
              title="Back to previous page"
              aria-label="Back to previous page"
            >
              <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="font-semibold">Back to Home</span>
            </button>

            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Go to website landing page"
            >
              <span>Website</span>
              <ExternalLink size={12} />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center space-x-3.5 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-white text-xl sm:text-2xl shadow-sm flex-shrink-0" style={{ backgroundColor: workspace.color || '#3b82f6' }}>
                <DynamicIcon name={workspace.icon || 'briefcase'} size={26} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center flex-wrap gap-2">
                  <span>{workspace.name}</span>
                  {role && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400 border border-blue-200 dark:border-blue-800 uppercase tracking-wider">
                      {role}
                    </span>
                  )}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm">
                  <span className="flex items-center"><Layout size={14} className="mr-1.5" /> {activeProjects.length} Active Projects</span>
                  <span className="flex items-center"><Users size={14} className="mr-1.5" /> {workspace.members.length} Members</span>
                  {archivedProjects.length > 0 && (
                    <button
                      onClick={() => setShowArchived(!showArchived)}
                      className="flex items-center text-xs text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      <Archive size={13} className="mr-1" />
                      {archivedProjects.length} Archived
                    </button>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2.5 sm:space-x-3 flex-wrap">
              {canManageWorkspace && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsSettingsModalOpen(true)}>
                    <Settings size={15} className="mr-1.5" />Settings
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    title="Delete Workspace"
                  >
                    <Trash2 size={15} className="mr-1.5" />Delete Workspace
                  </Button>
                </>
              )}

              {canCreateProject ? (
                <Button size="sm" onClick={() => setIsNewProjectModalOpen(true)}>
                  <Plus size={15} className="mr-1.5" /> New Project
                </Button>
              ) : (
                <Tooltip side="bottom" content="You do not have permission to create projects.">
                  <div>
                    <Button disabled size="sm" variant="outline" className="opacity-60 cursor-not-allowed">
                      <ShieldAlert size={15} className="mr-1.5 text-gray-400" /> New Project
                    </Button>
                  </div>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4 sm:p-8 max-w-5xl mx-auto w-full">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Active Projects</h2>
              {archivedProjects.length > 0 && (
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className="text-xs font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  {showArchived ? 'Hide Archived' : `Show Archived (${archivedProjects.length})`}
                </button>
              )}
            </div>

            {activeProjects.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
                <Layout size={40} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No projects yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Create a project or start from a predefined template.</p>
                <Button onClick={() => setIsNewProjectModalOpen(true)}>Create First Project</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeProjects.map(project => (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/w/${workspace.id}/p/${project.id}`)}
                    className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-between"
                  >
                    <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: project.color || '#3b82f6' }} />
                    <div>
                      <div className="flex items-center space-x-2.5 mb-2.5">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs shadow-xs flex-shrink-0"
                          style={{ backgroundColor: project.color || '#3b82f6' }}
                        >
                          <DynamicIcon name={project.icon || 'layout'} size={15} />
                        </div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {project.name}
                        </h3>
                      </div>
                      {project.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 h-8 leading-relaxed">
                          {project.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between mt-2">
                      <div className="flex -space-x-2 overflow-hidden">
                        {project.memberIds.map((memberId, i) => {
                          const user = users.find(u => u.id === memberId);
                          if (!user || i > 2) return null;
                          return (
                            <Avatar key={memberId} name={user.name} src={user.avatar} size="xs" className="ring-2 ring-white dark:ring-gray-900" />
                          );
                        })}
                        {project.memberIds.length > 3 && (
                          <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-900 flex items-center justify-center text-[9px] font-medium text-gray-600 dark:text-gray-300">
                            +{project.memberIds.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 font-medium group-hover:text-blue-500 transition-colors flex items-center">
                        Open <span className="ml-1 opacity-0 group-hover:opacity-100 transform translate-x-[-4px] group-hover:translate-x-0 transition-all">&rarr;</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Archived Projects (if toggled) */}
          {showArchived && archivedProjects.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-800 pt-8 mt-8">
              <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                <Archive size={16} className="mr-2 text-amber-500" />
                Archived Projects
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {archivedProjects.map(project => (
                  <div
                    key={project.id}
                    onClick={() => navigate(`/w/${workspace.id}/p/${project.id}`)}
                    className="bg-gray-50/60 dark:bg-gray-900/40 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 cursor-pointer hover:border-gray-400 transition-colors opacity-75 hover:opacity-100"
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs"
                        style={{ backgroundColor: project.color || '#9ca3af' }}
                      >
                        <DynamicIcon name={project.icon || 'layout'} size={13} />
                      </div>
                      <span className="font-medium text-sm text-gray-700 dark:text-gray-300 truncate">
                        {project.name}
                      </span>
                      <span className="ml-auto text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-1.5 py-0.5 rounded">
                        Archived
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Create Project Modal with Templates */}
        <CreateProjectModal
          isOpen={isNewProjectModalOpen}
          onClose={() => setIsNewProjectModalOpen(false)}
          workspaceId={workspace.id}
        />

        <WorkspaceSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
        />

        <DeleteWorkspaceModal
          workspace={workspace}
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      </div>
      );
}

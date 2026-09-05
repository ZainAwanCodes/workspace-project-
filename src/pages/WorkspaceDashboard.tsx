import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { addProject } from '@/lib/redux/slices/projectSlice';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Avatar } from '@/components/ui/Avatar';
import { Plus, Briefcase, Layout, Users, Settings } from 'lucide-react';
import { nanoid } from '@reduxjs/toolkit';
import { WorkspaceSettingsModal } from '@/components/settings/WorkspaceSettingsModal';

export default function WorkspaceDashboard() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const workspace = useAppSelector(state => 
    workspaceId ? state.workspaces.entities[workspaceId] : null
  );
  
  const projects = useAppSelector(state => 
    state.projects.ids
      .map(id => state.projects.entities[id]!)
      .filter(p => p.workspaceId === workspaceId && !p.isArchived)
  );
  
  const users = useAppSelector(state => state.auth.users);

  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  if (!workspace) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full">
        <Briefcase size={48} className="text-gray-300 dark:text-gray-700 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Workspace not found</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">The workspace you are looking for does not exist or you do not have permission to view it.</p>
        <Button className="mt-6" onClick={() => navigate('/')}>Return Home</Button>
      </div>
    );
  }

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    
    const newProjectId = nanoid();
    dispatch(addProject({
      id: newProjectId,
      workspaceId: workspace.id,
      name: newProjectName,
      color: '#3b82f6', // Default blue
      memberIds: [users[0].id], // Mock assigning the current user
      isArchived: false,
    }));
    
    setIsNewProjectModalOpen(false);
    setNewProjectName('');
    navigate(`/w/${workspace.id}/p/${newProjectId}`);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Workspace Header */}
      <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-8 py-8 flex-shrink-0">
        <div className="max-w-5xl mx-auto flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl shadow-sm" style={{ backgroundColor: workspace.color || '#3b82f6' }}>
              <Briefcase size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{workspace.name}</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center space-x-4">
                <span className="flex items-center"><Layout size={14} className="mr-1.5" /> {projects.length} Active Projects</span>
                <span className="flex items-center"><Users size={14} className="mr-1.5" /> {workspace.members.length} Members</span>
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setIsSettingsModalOpen(true)}>
              <Settings size={16} className="mr-2" />Settings
            </Button>
            <Button onClick={() => setIsNewProjectModalOpen(true)}>
              <Plus size={16} className="mr-2" /> New Project
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Active Projects</h2>
          
          {projects.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
              <Layout size={40} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No projects yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Create a project to start organizing your tasks.</p>
              <Button onClick={() => setIsNewProjectModalOpen(true)}>Create First Project</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <div 
                  key={project.id} 
                  onClick={() => navigate(`/w/${workspace.id}/p/${project.id}`)}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: project.color || '#3b82f6' }} />
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg truncate pr-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{project.name}</h3>
                  </div>
                  {project.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 h-10">
                      {project.description}
                    </p>
                  )}
                  
                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex -space-x-2 overflow-hidden">
                      {project.memberIds.map((memberId, i) => {
                        const user = users.find(u => u.id === memberId);
                        if (!user || i > 2) return null;
                        return (
                          <Avatar key={memberId} name={user.name} src={user.avatar} size="sm" className="ring-2 ring-white dark:ring-gray-900" />
                        );
                      })}
                      {project.memberIds.length > 3 && (
                        <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-900 flex items-center justify-center text-[10px] font-medium text-gray-600 dark:text-gray-300">
                          +{project.memberIds.length - 3}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 font-medium group-hover:text-blue-500 transition-colors flex items-center">
                      Open Project <span className="ml-1 opacity-0 group-hover:opacity-100 transform translate-x-[-4px] group-hover:translate-x-0 transition-all">&rarr;</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Project Modal */}
      <Modal isOpen={isNewProjectModalOpen} onClose={() => setIsNewProjectModalOpen(false)} title="Create New Project" size="sm">
        <form onSubmit={handleCreateProject} className="space-y-4">
          <Input 
            label="Project Name" 
            placeholder="e.g. Q4 Roadmap" 
            value={newProjectName} 
            onChange={(e) => setNewProjectName(e.target.value)} 
            autoFocus 
          />
          <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100 dark:border-gray-800">
            <Button type="button" variant="ghost" onClick={() => setIsNewProjectModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={!newProjectName.trim()}>Create Project</Button>
          </div>
        </form>
      </Modal>

      <WorkspaceSettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
}

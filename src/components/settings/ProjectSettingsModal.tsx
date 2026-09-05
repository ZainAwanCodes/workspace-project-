import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { updateProject, removeProject, archiveProject, setActiveProject } from '@/lib/redux/slices/projectSlice';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Trash2, Archive } from 'lucide-react';

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

export const ProjectSettingsModal = ({ isOpen, onClose, projectId }: ProjectSettingsModalProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const project = useAppSelector(state => state.projects.entities[projectId]);
  const activeWorkspaceId = useAppSelector(state => state.workspaces.activeWorkspaceId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');
  
  // Danger Zone
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  useEffect(() => {
    if (project && isOpen) {
      setName(project.name);
      setDescription(project.description || '');
      setColor(project.color || '#3b82f6');
      setDeleteConfirmation('');
    }
  }, [project, isOpen]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !project) return;

    dispatch(updateProject({
      id: project.id,
      changes: {
        name,
        description,
        color
      }
    }));
    
    onClose();
  };

  const handleArchive = () => {
    if (!project) return;
    dispatch(archiveProject(project.id));
    onClose();
    if (activeWorkspaceId) {
      navigate(`/w/${activeWorkspaceId}`);
    }
  };

  const handleDelete = () => {
    if (!project) return;
    if (deleteConfirmation !== project.name) return;

    dispatch(removeProject(project.id));
    dispatch(setActiveProject(null));
    onClose();
    if (activeWorkspaceId) {
      navigate(`/w/${activeWorkspaceId}`);
    } else {
      navigate('/');
    }
  };

  if (!project) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Project Settings" size="md">
      <div className="space-y-6">
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input 
            label="Project Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none h-24"
              placeholder="Brief description of the project"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Color
            </label>
            <div className="flex items-center space-x-3">
              <input 
                type="color" 
                value={color} 
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-10 rounded cursor-pointer border-0 p-0"
              />
              <Input 
                value={color} 
                onChange={(e) => setColor(e.target.value)} 
                className="flex-1"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" disabled={!name.trim()}>Save Changes</Button>
          </div>
        </form>

        <div className="border-t border-red-200 dark:border-red-900/30 pt-6 mt-6">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-500 flex items-center mb-2">
            <AlertCircle size={20} className="mr-2" />
            Danger Zone
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Archiving a project hides it from the active lists. Deleting it is irreversible.
          </p>
          
          <div className="flex space-x-3 mb-4">
            <Button variant="outline" className="w-full" onClick={handleArchive}>
              <Archive size={16} className="mr-2" />
              Archive Project
            </Button>
          </div>

          <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-100 dark:border-red-900/30">
            <label className="block text-sm font-medium text-red-800 dark:text-red-400 mb-2">
              Type <span className="font-bold">"{project.name}"</span> to confirm
            </label>
            <Input 
              value={deleteConfirmation} 
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Confirm project name"
              className="mb-3"
            />
            <Button 
              variant="destructive" 
              className="w-full"
              disabled={deleteConfirmation !== project.name}
              onClick={handleDelete}
            >
              <Trash2 size={16} className="mr-2" />
              Delete Project
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

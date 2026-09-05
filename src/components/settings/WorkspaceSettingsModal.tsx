import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { updateWorkspace, removeWorkspace, setActiveWorkspace } from '@/lib/redux/slices/workspaceSlice';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Trash2 } from 'lucide-react';

interface WorkspaceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkspaceSettingsModal = ({ isOpen, onClose }: WorkspaceSettingsModalProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const activeWorkspaceId = useAppSelector(state => state.workspaces.activeWorkspaceId);
  const workspace = useAppSelector(state => 
    activeWorkspaceId ? state.workspaces.entities[activeWorkspaceId] : null
  );

  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  
  // Danger Zone
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  useEffect(() => {
    if (workspace && isOpen) {
      setName(workspace.name);
      setColor(workspace.color || '#3b82f6');
      setDeleteConfirmation('');
    }
  }, [workspace, isOpen]);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !workspace) return;

    dispatch(updateWorkspace({
      id: workspace.id,
      changes: {
        name,
        color
      }
    }));
    
    onClose();
  };

  const handleDelete = () => {
    if (!workspace) return;
    if (deleteConfirmation !== workspace.name) return;

    dispatch(removeWorkspace(workspace.id));
    dispatch(setActiveWorkspace(null));
    onClose();
    navigate('/');
  };

  if (!workspace) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Workspace Settings" size="md">
      <div className="space-y-6">
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input 
            label="Workspace Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Workspace Color
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
            Deleting a workspace is irreversible and will remove all associated projects and tasks.
          </p>
          
          <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-100 dark:border-red-900/30">
            <label className="block text-sm font-medium text-red-800 dark:text-red-400 mb-2">
              Type <span className="font-bold">"{workspace.name}"</span> to confirm
            </label>
            <Input 
              value={deleteConfirmation} 
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Confirm workspace name"
              className="mb-3"
            />
            <Button 
              variant="destructive" 
              className="w-full"
              disabled={deleteConfirmation !== workspace.name}
              onClick={handleDelete}
            >
              <Trash2 size={16} className="mr-2" />
              Delete Workspace
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

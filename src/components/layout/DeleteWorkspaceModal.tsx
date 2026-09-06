import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { removeWorkspace, setActiveWorkspace } from '@/lib/redux/slices/workspaceSlice';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AlertCircle, Trash2 } from 'lucide-react';
import { DynamicIcon } from '@/utils/iconMap';
import { useNavigate } from 'react-router-dom';
import { Workspace } from '@/types/workspace';

interface DeleteWorkspaceModalProps {
  workspace: Workspace | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteWorkspaceModal: React.FC<DeleteWorkspaceModalProps> = ({
  workspace,
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const workspaces = useAppSelector(state =>
    state.workspaces.ids.map(id => state.workspaces.entities[id]!)
  );

  const projects = useAppSelector(state =>
    workspace
      ? state.projects.ids
          .map(id => state.projects.entities[id]!)
          .filter(p => p.workspaceId === workspace.id)
      : []
  );

  const [confirmText, setConfirmText] = useState('');

  if (!workspace) return null;

  const isConfirmed = confirmText.trim().toLowerCase() === workspace.name.trim().toLowerCase();

  const handleDelete = () => {
    if (!isConfirmed) return;

    const remainingWorkspaces = workspaces.filter(w => w.id !== workspace.id);

    dispatch(removeWorkspace(workspace.id));
    onClose();
    setConfirmText('');

    if (remainingWorkspaces.length > 0) {
      const nextWorkspace = remainingWorkspaces[0];
      dispatch(setActiveWorkspace(nextWorkspace.id));
      navigate(`/w/${nextWorkspace.id}`);
    } else {
      dispatch(setActiveWorkspace(null));
      navigate('/');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Workspace" size="md">
      <div className="space-y-5">
        {/* Workspace Card Header */}
        <div className="flex items-center space-x-3.5 p-3.5 rounded-xl bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
            style={{ backgroundColor: workspace.color || '#ef4444' }}
          >
            <DynamicIcon name={workspace.icon || 'briefcase'} size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-base">
              {workspace.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Contains <span className="font-medium text-gray-700 dark:text-gray-300">{projects.length} project{projects.length === 1 ? '' : 's'}</span> and <span className="font-medium text-gray-700 dark:text-gray-300">{workspace.members.length} member{workspace.members.length === 1 ? '' : 's'}</span>.
            </p>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="flex items-start space-x-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs leading-relaxed">
          <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block mb-0.5">This action is permanent and cannot be undone!</strong>
            All associated projects, tasks, comments, and settings will be permanently removed.
          </div>
        </div>

        {/* Confirmation Input */}
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Type <span className="font-bold underline text-red-600 dark:text-red-400">{workspace.name}</span> to confirm deletion:
          </label>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={workspace.name}
            autoFocus
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end space-x-3 border-t border-gray-100 dark:border-gray-800">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!isConfirmed}
            onClick={handleDelete}
          >
            <Trash2 size={15} className="mr-1.5" />
            Delete Workspace
          </Button>
        </div>
      </div>
    </Modal>
  );
};

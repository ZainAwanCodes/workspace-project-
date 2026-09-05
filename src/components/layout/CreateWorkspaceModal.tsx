import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { addWorkspace, setActiveWorkspace } from '@/lib/redux/slices/workspaceSlice';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AVAILABLE_ICONS, PRESET_COLORS, DynamicIcon } from '@/utils/iconMap';
import { nanoid } from '@reduxjs/toolkit';
import { Kanban, List as ListIcon, Calendar, Check, Users } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Role } from '@/types/user';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const currentUser = useAppSelector(state => state.auth.currentUser);
  const allUsers = useAppSelector(state => state.auth.users);

  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('briefcase');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [defaultView, setDefaultView] = useState<'kanban' | 'list' | 'calendar'>('kanban');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  const handleToggleMember = (userId: string) => {
    if (selectedMemberIds.includes(userId)) {
      setSelectedMemberIds(selectedMemberIds.filter(id => id !== userId));
    } else {
      setSelectedMemberIds([...selectedMemberIds, userId]);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !currentUser) return;

    const newId = `w_${nanoid(8)}`;
    
    // Build member list with current user as owner
    const members = [
      { userId: currentUser.id, role: 'owner' as Role },
      ...selectedMemberIds
        .filter(id => id !== currentUser.id)
        .map(id => ({ userId: id, role: 'member' as Role }))
    ];

    dispatch(addWorkspace({
      id: newId,
      name: name.trim(),
      icon: selectedIcon,
      color: selectedColor,
      defaultView,
      members,
    }));

    dispatch(setActiveWorkspace(newId));
    onClose();
    setName('');
    setSelectedMemberIds([]);
    navigate(`/w/${newId}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Workspace" size="md">
      <form onSubmit={handleCreate} className="space-y-6">
        {/* Live Preview & Workspace Name */}
        <div className="flex items-start space-x-4">
          <div 
            className="w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0 transition-colors"
            style={{ backgroundColor: selectedColor }}
          >
            <DynamicIcon name={selectedIcon} size={28} />
          </div>
          <div className="flex-1">
            <Input
              label="Workspace Name"
              placeholder="e.g. Design Team, Acme HQ"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
        </div>

        {/* Icon Selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            Select Icon
          </label>
          <div className="grid grid-cols-6 gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            {AVAILABLE_ICONS.map((item) => {
              const isSelected = selectedIcon === item.id;
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedIcon(item.id)}
                  title={item.label}
                  className={`h-9 flex items-center justify-center rounded-md transition-colors ${
                    isSelected 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <IconComp size={18} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Color Palette */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            Color Accent
          </label>
          <div className="flex items-center space-x-2">
            {PRESET_COLORS.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => setSelectedColor(hex)}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 relative"
                style={{ backgroundColor: hex }}
              >
                {selectedColor === hex && (
                  <Check size={14} className="text-white drop-shadow-xs" />
                )}
              </button>
            ))}
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-7 h-7 rounded-full cursor-pointer border-0 p-0 ml-1 overflow-hidden"
              title="Custom color"
            />
          </div>
        </div>

        {/* Default View Mode */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
            Default Project View
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'kanban' as const, label: 'Kanban', icon: Kanban },
              { id: 'list' as const, label: 'List', icon: ListIcon },
              { id: 'calendar' as const, label: 'Calendar', icon: Calendar },
            ].map((v) => {
              const isSelected = defaultView === v.id;
              const IconComp = v.icon;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setDefaultView(v.id)}
                  className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <IconComp size={16} />
                  <span>{v.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Invite Mock Members to Workspace */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Workspace Team Members
            </label>
            <span className="text-xs text-gray-400 flex items-center">
              <Users size={12} className="mr-1" />
              {1 + selectedMemberIds.length} members
            </span>
          </div>
          <div className="space-y-1 max-h-36 overflow-y-auto border border-gray-200 dark:border-gray-800 rounded-lg p-2 bg-gray-50/50 dark:bg-gray-900/50">
            {allUsers.map((user) => {
              const isCurrent = user.id === currentUser?.id;
              const isSelected = isCurrent || selectedMemberIds.includes(user.id);
              return (
                <div
                  key={user.id}
                  onClick={() => !isCurrent && handleToggleMember(user.id)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-sm cursor-pointer transition-colors ${
                    isCurrent 
                      ? 'bg-blue-50 dark:bg-blue-950/40 cursor-default' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Avatar name={user.name} src={user.avatar} size="xs" />
                    <div>
                      <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                        {user.name} {isCurrent && <span className="text-blue-600 dark:text-blue-400">(You - Owner)</span>}
                      </div>
                      <div className="text-[11px] text-gray-400">{user.email}</div>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center">
                      <Check size={14} className="mr-1" /> Added
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-2 flex justify-end space-x-3 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!name.trim()}>
            Create Workspace
          </Button>
        </div>
      </form>
    </Modal>
  );
};

import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { 
  setFilters, 
  clearFilters, 
  applyFilterPreset, 
  saveFilterPreset, 
  deleteFilterPreset,
  FilterPreset
} from '@/lib/redux/slices/uiSlice';
import { Dropdown, DropdownTrigger, DropdownContent } from '../ui/Dropdown';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Modal } from '../ui/Modal';
import { 
  Filter, 
  X, 
  Bookmark, 
  BookmarkCheck, 
  Plus, 
  Trash2, 
  Flame, 
  Clock, 
  ListTodo, 
  CheckCircle2, 
  UserCheck, 
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';

export const FilterBar = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(state => state.ui.activeFilters);
  const presets = useAppSelector(state => state.ui.filterPresets);
  const activePresetId = useAppSelector(state => state.ui.activePresetId);
  const users = useAppSelector(state => state.auth.users);
  const currentUser = useAppSelector(state => state.auth.currentUser);

  const [isSavePresetModalOpen, setIsSavePresetModalOpen] = useState(false);
  const [presetNameInput, setPresetNameInput] = useState('');

  const activeCount = 
    filters.assigneeIds.length + 
    filters.labels.length + 
    filters.priorities.length + 
    filters.statuses.length;

  const isAssignedToMeActive = currentUser 
    ? filters.assigneeIds.length === 1 && filters.assigneeIds[0] === currentUser.id 
    : false;

  const handlePriorityToggle = (priority: string) => {
    const newPriorities = filters.priorities.includes(priority)
      ? filters.priorities.filter(p => p !== priority)
      : [...filters.priorities, priority];
    dispatch(setFilters({ priorities: newPriorities }));
  };

  const handleStatusToggle = (status: string) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    dispatch(setFilters({ statuses: newStatuses }));
  };

  const handleAssigneeToggle = (userId: string) => {
    const newAssignees = filters.assigneeIds.includes(userId)
      ? filters.assigneeIds.filter(id => id !== userId)
      : [...filters.assigneeIds, userId];
    dispatch(setFilters({ assigneeIds: newAssignees }));
  };

  const handleMyTasksQuickToggle = () => {
    if (!currentUser) return;
    if (isAssignedToMeActive) {
      dispatch(setFilters({ assigneeIds: [] }));
    } else {
      dispatch(setFilters({ assigneeIds: [currentUser.id] }));
    }
  };

  const handleApplyPreset = (preset: FilterPreset) => {
    dispatch(applyFilterPreset({ presetId: preset.id, filters: preset.filters }));
  };

  const handleSavePresetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetNameInput.trim()) return;

    dispatch(saveFilterPreset({
      name: presetNameInput.trim(),
      filters: { ...filters },
    }));

    setPresetNameInput('');
    setIsSavePresetModalOpen(false);
  };

  const renderPresetIcon = (preset: FilterPreset) => {
    switch (preset.icon) {
      case 'Flame': return <Flame size={13} className="text-orange-500 mr-2 flex-shrink-0" />;
      case 'Clock': return <Clock size={13} className="text-blue-500 mr-2 flex-shrink-0" />;
      case 'ListTodo': return <ListTodo size={13} className="text-purple-500 mr-2 flex-shrink-0" />;
      case 'CheckCircle2': return <CheckCircle2 size={13} className="text-emerald-500 mr-2 flex-shrink-0" />;
      default: return <Bookmark size={13} className="text-blue-500 mr-2 flex-shrink-0" />;
    }
  };

  const activePreset = presets.find(p => p.id === activePresetId);

  return (
    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
      {/* Quick "My Tasks" Toggle */}
      {currentUser && (
        <button
          onClick={handleMyTasksQuickToggle}
          className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            isAssignedToMeActive
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
          title="Filter tasks assigned to you"
        >
          <UserCheck size={13} />
          <span>My Tasks</span>
        </button>
      )}

      {/* Saved Presets Dropdown */}
      <Dropdown>
        <DropdownTrigger>
          <Button 
            variant="outline" 
            size="sm" 
            className={activePreset ? "border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30" : ""}
          >
            <BookmarkCheck size={14} className="mr-1.5" />
            <span className="hidden sm:inline">Presets</span>
            {activePreset && (
              <span className="ml-1.5 text-[11px] font-semibold text-purple-700 dark:text-purple-300 truncate max-w-[100px]">
                : {activePreset.name}
              </span>
            )}
          </Button>
        </DropdownTrigger>
        <DropdownContent align="right" className="w-[calc(100vw-2rem)] sm:w-72 max-w-xs p-1 space-y-1">
          <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span>Filter Presets</span>
            <Sparkles size={12} className="text-purple-500" />
          </div>

          <div className="py-1 max-h-60 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800/60">
            {/* System Presets */}
            <div className="py-1">
              <div className="px-3 py-1 text-[10px] font-medium text-gray-400 uppercase">Default Presets</div>
              {presets.filter(p => p.isSystem).map(preset => {
                const isActive = activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset)}
                    className={`w-full px-3 py-1.5 flex items-center justify-between text-left text-xs rounded-md transition-colors ${
                      isActive 
                        ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-200 font-semibold' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center truncate">
                      {renderPresetIcon(preset)}
                      <span className="truncate">{preset.name}</span>
                    </div>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-purple-500 ml-2" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Presets */}
            {presets.filter(p => !p.isSystem).length > 0 && (
              <div className="py-1">
                <div className="px-3 py-1 text-[10px] font-medium text-gray-400 uppercase">Custom Presets</div>
                {presets.filter(p => !p.isSystem).map(preset => {
                  const isActive = activePresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-md text-xs group ${
                        isActive 
                          ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-200 font-semibold' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <button
                        onClick={() => handleApplyPreset(preset)}
                        className="flex-1 flex items-center text-left truncate mr-2"
                      >
                        {renderPresetIcon(preset)}
                        <span className="truncate">{preset.name}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(deleteFilterPreset(preset.id));
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete preset"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Save Current Filter as Preset Button */}
          {activeCount > 0 && (
            <div className="pt-1.5 border-t border-gray-100 dark:border-gray-800 px-1">
              <button
                onClick={() => setIsSavePresetModalOpen(true)}
                className="w-full flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-md bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs font-medium transition-colors"
              >
                <Plus size={13} />
                <span>Save active filters as preset</span>
              </button>
            </div>
          )}
        </DropdownContent>
      </Dropdown>

      {/* Main Filter Dropdown */}
      <Dropdown>
        <DropdownTrigger>
          <Button 
            variant="outline" 
            size="sm" 
            className={activeCount > 0 ? "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20" : ""}
          >
            <Filter size={14} className="mr-1.5" /> 
            <span>Filter</span>
            {activeCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-800 text-[10px] leading-none font-bold">
                {activeCount}
              </span>
            )}
          </Button>
        </DropdownTrigger>
        <DropdownContent align="right" className="w-[calc(100vw-2rem)] sm:w-72 max-w-xs p-4 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Priority */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-2">
              Priority
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {['low', 'medium', 'high', 'urgent'].map(p => (
                <button
                  key={p}
                  onClick={() => handlePriorityToggle(p)}
                  className={`text-xs px-2.5 py-1 rounded-full border capitalize transition-colors ${
                    filters.priorities.includes(p) 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-2">
              Status
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {['todo', 'in-progress', 'review', 'done'].map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusToggle(s)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    filters.statuses.includes(s) 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {s.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Assignee */}
          <div>
            <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-2">
              Assignee
            </h4>
            <div className="space-y-1 max-h-36 overflow-y-auto">
              {users.map(u => {
                const isSelected = filters.assigneeIds.includes(u.id);
                return (
                  <button
                    key={u.id}
                    onClick={() => handleAssigneeToggle(u.id)}
                    className={`w-full flex items-center space-x-2 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                      isSelected 
                        ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200 font-medium' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Avatar name={u.name} src={u.avatar} size="xs" />
                    <span className="flex-1 text-left truncate">{u.name}</span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Action Bar inside Filter Dropdown */}
          <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between space-x-2">
            {activeCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-gray-500 hover:text-red-500 flex-1" 
                onClick={() => dispatch(clearFilters())}
              >
                Clear all
              </Button>
            )}
            {activeCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs text-purple-600 border-purple-300 dark:border-purple-800 flex-1" 
                onClick={() => setIsSavePresetModalOpen(true)}
              >
                Save Preset
              </Button>
            )}
          </div>
        </DropdownContent>
      </Dropdown>
      
      {/* Active Filter Badges */}
      {activeCount > 0 && (
        <div className="hidden md:flex items-center space-x-1.5">
          {filters.priorities.map(p => (
            <Badge key={p} variant="outline" className="flex items-center space-x-1 text-[11px] py-0.5">
              <span>Priority: {p}</span>
              <X size={11} className="cursor-pointer hover:text-red-500 ml-1" onClick={() => handlePriorityToggle(p)} />
            </Badge>
          ))}
          {filters.statuses.map(s => (
            <Badge key={s} variant="outline" className="flex items-center space-x-1 text-[11px] py-0.5">
              <span>Status: {s.replace('-', ' ')}</span>
              <X size={11} className="cursor-pointer hover:text-red-500 ml-1" onClick={() => handleStatusToggle(s)} />
            </Badge>
          ))}
          {filters.assigneeIds.map(id => {
            const user = users.find(u => u.id === id);
            return user ? (
              <Badge key={id} variant="outline" className="flex items-center space-x-1 text-[11px] py-0.5">
                <span>Assignee: {user.name.split(' ')[0]}</span>
                <X size={11} className="cursor-pointer hover:text-red-500 ml-1" onClick={() => handleAssigneeToggle(id)} />
              </Badge>
            ) : null;
          })}
        </div>
      )}

      {/* Modal: Save Filter Preset */}
      <Modal
        isOpen={isSavePresetModalOpen}
        onClose={() => setIsSavePresetModalOpen(false)}
        title="Save Filter Preset"
        size="sm"
      >
        <form onSubmit={handleSavePresetSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Preset Name
            </label>
            <input
              type="text"
              placeholder="e.g. My Urgent Bugs, Needs Code Review"
              value={presetNameInput}
              onChange={(e) => setPresetNameInput(e.target.value)}
              autoFocus
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-800 text-xs text-gray-500 space-y-1">
            <div className="font-semibold text-gray-700 dark:text-gray-300">Filters included in preset:</div>
            <div>• Priorities: {filters.priorities.length > 0 ? filters.priorities.join(', ') : 'Any'}</div>
            <div>• Statuses: {filters.statuses.length > 0 ? filters.statuses.map(s => s.replace('-', ' ')).join(', ') : 'Any'}</div>
            <div>• Assignees: {filters.assigneeIds.length > 0 ? `${filters.assigneeIds.length} members` : 'Any'}</div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSavePresetModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={!presetNameInput.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Save Preset
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

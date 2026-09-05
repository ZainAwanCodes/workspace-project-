import React from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { setFilters, clearFilters } from '@/lib/redux/slices/uiSlice';
import { Dropdown, DropdownTrigger, DropdownContent } from '../ui/Dropdown';
import { Button } from '../ui/Button';
import { Filter, X } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const FilterBar = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(state => state.ui.activeFilters);
  
  const activeCount = 
    filters.assigneeIds.length + 
    filters.labels.length + 
    filters.priorities.length + 
    filters.statuses.length;

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

  return (
    <div className="flex items-center space-x-2">
      <Dropdown>
        <DropdownTrigger>
          <Button variant="outline" size="sm" className={activeCount > 0 ? "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-900/20" : ""}>
            <Filter size={14} className="mr-1.5" /> 
            Filter {activeCount > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-800 text-[10px] leading-none">{activeCount}</span>}
          </Button>
        </DropdownTrigger>
        <DropdownContent align="right" className="w-64 p-4 space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-2">Priority</h4>
            <div className="flex flex-wrap gap-2">
              {['low', 'medium', 'high', 'urgent'].map(p => (
                <button
                  key={p}
                  onClick={() => handlePriorityToggle(p)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    filters.priorities.includes(p) 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider mb-2">Status</h4>
            <div className="flex flex-wrap gap-2">
              {['todo', 'in-progress', 'review', 'done'].map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusToggle(s)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    filters.statuses.includes(s) 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {s.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>
          
          {activeCount > 0 && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <Button variant="ghost" size="sm" className="w-full text-gray-500" onClick={() => dispatch(clearFilters())}>
                Clear all filters
              </Button>
            </div>
          )}
        </DropdownContent>
      </Dropdown>
      
      {activeCount > 0 && (
        <div className="hidden sm:flex items-center space-x-1">
          {filters.priorities.map(p => (
            <Badge key={p} variant="outline" className="flex items-center space-x-1">
              <span>Priority: {p}</span>
              <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => handlePriorityToggle(p)} />
            </Badge>
          ))}
          {filters.statuses.map(s => (
            <Badge key={s} variant="outline" className="flex items-center space-x-1">
              <span>Status: {s}</span>
              <X size={12} className="cursor-pointer hover:text-red-500" onClick={() => handleStatusToggle(s)} />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

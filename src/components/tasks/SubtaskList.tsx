import React, { useState } from 'react';
import { useAppDispatch } from '@/lib/redux/hooks';
import { addSubtask, updateSubtask, removeSubtask } from '@/lib/redux/slices/taskSlice';
import { Subtask, Task } from '@/types/task';
import { Button } from '@/components/ui/Button';
import { Plus, X, CheckSquare, Square } from 'lucide-react';
import { nanoid } from '@reduxjs/toolkit';

export const SubtaskList = ({ task }: { task: Task }) => {
  const dispatch = useAppDispatch();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    dispatch(addSubtask({
      taskId: task.id,
      subtask: {
        id: nanoid(),
        taskId: task.id,
        title: newTitle,
        isCompleted: false,
      }
    }));
    
    setNewTitle('');
    setIsAdding(false);
  };

  const handleToggle = (subtask: Subtask) => {
    dispatch(updateSubtask({
      taskId: task.id,
      subtaskId: subtask.id,
      changes: { isCompleted: !subtask.isCompleted }
    }));
  };

  const handleRemove = (subtaskId: string) => {
    dispatch(removeSubtask({ taskId: task.id, subtaskId }));
  };

  const completedCount = task.subtasks?.filter(st => st.isCompleted).length || 0;
  const totalCount = task.subtasks?.length || 0;
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
          <CheckSquare size={16} className="mr-2" /> Subtasks
        </h3>
        {totalCount > 0 && (
          <span className="text-xs font-medium text-gray-500">
            {completedCount}/{totalCount} ({progress}%)
          </span>
        )}
      </div>

      {totalCount > 0 && (
        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 mb-4">
          <div 
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="space-y-2">
        {task.subtasks?.map(subtask => (
          <div 
            key={subtask.id} 
            className="flex items-start group rounded-md p-2 hover:bg-gray-50 dark:hover:bg-gray-900 border border-transparent hover:border-gray-200 dark:hover:border-gray-800 transition-colors"
          >
            <button 
              onClick={() => handleToggle(subtask)}
              className="mt-0.5 text-gray-400 hover:text-blue-500 transition-colors focus:outline-none"
            >
              {subtask.isCompleted ? (
                <CheckSquare size={16} className="text-blue-500" />
              ) : (
                <Square size={16} />
              )}
            </button>
            <span className={`flex-1 ml-3 text-sm ${subtask.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
              {subtask.title}
            </span>
            <button 
              onClick={() => handleRemove(subtask.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all focus:outline-none"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {isAdding ? (
        <form onSubmit={handleAdd} className="mt-2 flex items-center space-x-2">
          <input
            type="text"
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 text-sm bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Button type="submit" size="sm" disabled={!newTitle.trim()}>Add</Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
        </form>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-2 border-dashed text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          onClick={() => setIsAdding(true)}
        >
          <Plus size={14} className="mr-2" /> Add subtask
        </Button>
      )}
    </div>
  );
};

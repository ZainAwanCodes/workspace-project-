import React, { useState } from 'react';
import { useAppDispatch } from '@/lib/redux/hooks';
import { addSubtask, updateSubtask, removeSubtask, convertSubtaskToTask } from '@/lib/redux/slices/taskSlice';
import { Subtask, Task } from '@/types/task';
import { Button } from '@/components/ui/Button';
import { Plus, X, CheckSquare, Square, ArrowUpRight, Edit2, Check } from 'lucide-react';
import { nanoid } from '@reduxjs/toolkit';

export const SubtaskList = ({ task }: { task: Task }) => {
  const dispatch = useAppDispatch();
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    dispatch(addSubtask({
      taskId: task.id,
      subtask: {
        id: nanoid(),
        taskId: task.id,
        title: newTitle.trim(),
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

  const handleConvertToTask = (subtask: Subtask) => {
    dispatch(convertSubtaskToTask({
      taskId: task.id,
      subtaskId: subtask.id,
      projectId: task.projectId
    }));
  };

  const startEditing = (subtask: Subtask) => {
    setEditingSubtaskId(subtask.id);
    setEditingTitle(subtask.title);
  };

  const saveEditing = (subtaskId: string) => {
    if (editingTitle.trim()) {
      dispatch(updateSubtask({
        taskId: task.id,
        subtaskId,
        changes: { title: editingTitle.trim() }
      }));
    }
    setEditingSubtaskId(null);
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

      <div className="space-y-1.5">
        {task.subtasks?.map(subtask => {
          const isEditingThis = editingSubtaskId === subtask.id;

          return (
            <div 
              key={subtask.id} 
              className="flex items-center justify-between group rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-900 border border-transparent hover:border-gray-200 dark:border-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-2.5 flex-1 min-w-0 mr-2">
                <button 
                  onClick={() => handleToggle(subtask)}
                  className="text-gray-400 hover:text-blue-500 transition-colors focus:outline-none flex-shrink-0"
                >
                  {subtask.isCompleted ? (
                    <CheckSquare size={16} className="text-blue-500" />
                  ) : (
                    <Square size={16} />
                  )}
                </button>

                {isEditingThis ? (
                  <div className="flex items-center space-x-1 flex-1">
                    <input
                      type="text"
                      autoFocus
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEditing(subtask.id);
                        if (e.key === 'Escape') setEditingSubtaskId(null);
                      }}
                      className="flex-1 text-xs bg-white dark:bg-gray-950 border border-blue-500 rounded px-2 py-1 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => saveEditing(subtask.id)}
                      className="p-1 text-green-600 hover:text-green-700"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => setEditingSubtaskId(null)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <span 
                    onDoubleClick={() => startEditing(subtask)}
                    className={`text-xs truncate cursor-pointer ${subtask.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'}`}
                    title="Double click to edit"
                  >
                    {subtask.title}
                  </span>
                )}
              </div>

              {!isEditingThis && (
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleConvertToTask(subtask)}
                    className="p-1 text-gray-400 hover:text-blue-500 rounded transition-colors"
                    title="Convert to standalone task"
                  >
                    <ArrowUpRight size={13} />
                  </button>
                  <button
                    onClick={() => startEditing(subtask)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                    title="Edit subtask"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button 
                    onClick={() => handleRemove(subtask.id)}
                    className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                    title="Delete subtask"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isAdding ? (
        <form onSubmit={handleAdd} className="mt-2 flex items-center space-x-2">
          <input
            type="text"
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 text-xs bg-white dark:bg-gray-950 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Button type="submit" size="sm" disabled={!newTitle.trim()}>Add</Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
        </form>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-2 border-dashed text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          onClick={() => setIsAdding(true)}
        >
          <Plus size={14} className="mr-1.5" /> Add subtask
        </Button>
      )}
    </div>
  );
};

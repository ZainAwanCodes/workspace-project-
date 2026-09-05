import React, { useMemo } from 'react';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskStatus } from '@/types/task';
import { TaskCard } from '@/components/tasks/TaskCard';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  column: { id: TaskStatus; title: string };
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
  onAddTask?: (status: TaskStatus) => void;
  key?: React.Key;
}

export const KanbanColumn = ({ column, tasks, onTaskClick, onAddTask }: KanbanColumnProps) => {
  const taskIds = useMemo(() => tasks.map(t => t.id), [tasks]);

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      status: column.id,
    },
  });

  return (
    <div className="flex flex-col w-[300px] min-w-[300px] bg-gray-50/50 dark:bg-gray-900/50 rounded-xl flex-shrink-0 border border-gray-200 dark:border-gray-800 h-full max-h-full">
      {/* Column Header */}
      <div className="p-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
            {column.title}
          </h3>
          <span className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs py-0.5 px-2 rounded-full font-medium">
            {tasks.length}
          </span>
        </div>

        {onAddTask && (
          <button
            onClick={() => onAddTask(column.id)}
            className="p-1 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors"
            title={`Add task to ${column.title}`}
          >
            <Plus size={15} />
          </button>
        )}
      </div>

      {/* Droppable Area */}
      <div 
        ref={setNodeRef}
        className={`flex-1 p-2 overflow-y-auto space-y-2 transition-colors ${
          isOver ? 'bg-gray-100/50 dark:bg-gray-800/50' : ''
        }`}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} onClick={() => onTaskClick(task.id)} />
          ))}
        </SortableContext>
        
        {/* Placeholder if empty */}
        {tasks.length === 0 && (
          <div className="h-full w-full rounded border-2 border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center min-h-[100px]">
            <span className="text-gray-400 text-sm">Drop tasks here</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Wrapper for Sortable item
const SortableTaskCard = ({ task, onClick }: { task: Task, onClick: () => void, key?: React.Key }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <TaskCard task={task} onClick={onClick} isDragging={isDragging} />
    </div>
  );
};

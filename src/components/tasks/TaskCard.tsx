import React from 'react';
import { useAppSelector } from '@/lib/redux/hooks';
import { Task } from '@/types/task';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Calendar, MessageSquare, Paperclip, CheckSquare } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { cn } from '@/utils/cn';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  isDragging?: boolean;
}

export const TaskCard = ({ task, onClick, isDragging }: TaskCardProps) => {
  const users = useAppSelector(state => state.auth.users);
  const assignee = users.find(u => u.id === task.assigneeId);

  // Priority Colors
  const priorityColors = {
    low: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };

  // Compute subtask progress
  const totalSubtasks = task.subtasks.length;
  const completedSubtasks = task.subtasks.filter(st => st.isCompleted).length;

  // Due Date Formatting
  const renderDueDate = () => {
    if (!task.dueDate) return null;
    const date = new Date(task.dueDate);
    const isOverdue = isPast(date) && !isToday(date) && task.status !== 'done';
    
    return (
      <div className={cn(
        "flex items-center text-xs font-medium",
        isOverdue ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"
      )}>
        <Calendar size={12} className="mr-1" />
        {format(date, 'MMM d')}
      </div>
    );
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-white dark:bg-gray-900 border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-blue-400 dark:hover:border-blue-500 transition-all shadow-sm group relative",
        isDragging ? "opacity-50 border-blue-500 shadow-md ring-2 ring-blue-500 ring-opacity-20" : "border-gray-200 dark:border-gray-800",
      )}
    >
      <div className="flex justify-between items-start mb-2 gap-2">
        <div className="flex flex-wrap gap-1">
          {task.labels.map(label => (
            <Badge key={label} variant="outline" size="sm" className="text-[10px] py-0">
              {label}
            </Badge>
          ))}
        </div>
      </div>
      
      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
        {task.title}
      </h4>
      
      {task.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center space-x-3">
          {/* Priority Badge */}
          <div className={cn("px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider", priorityColors[task.priority])}>
            {task.priority}
          </div>
          
          {/* Metrics */}
          <div className="flex items-center space-x-2 text-gray-400 dark:text-gray-500">
            {totalSubtasks > 0 && (
              <div className="flex items-center text-xs">
                <CheckSquare size={12} className="mr-1" />
                {completedSubtasks}/{totalSubtasks}
              </div>
            )}
            {task.comments?.length > 0 && (
              <div className="flex items-center text-xs">
                <MessageSquare size={12} className="mr-1" />
                {task.comments.length}
              </div>
            )}
            {task.attachments?.length > 0 && (
              <div className="flex items-center text-xs">
                <Paperclip size={12} className="mr-1" />
                {task.attachments.length}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {renderDueDate()}
          {assignee ? (
            <Avatar name={assignee.name} src={assignee.avatar} size="sm" />
          ) : (
            <div className="w-6 h-6 rounded-full border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-400">
              <span className="text-xs">?</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

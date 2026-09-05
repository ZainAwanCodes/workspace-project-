import React, { useState, useMemo } from 'react';
import { useAppSelector } from '@/lib/redux/hooks';
import { selectFilteredTasks } from '@/lib/redux/selectors/taskSelectors';
import { DEFAULT_KANBAN_COLUMNS, KanbanColumnDef } from '@/types/project';
import { 
  format, 
  startOfWeek, 
  addDays, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday 
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  Flag 
} from 'lucide-react';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';

export const CalendarView = ({ projectId, onTaskClick }: { projectId: string; onTaskClick: (id: string) => void }) => {
  const tasks = useAppSelector(state => selectFilteredTasks(state, projectId));
  const project = useAppSelector(state => state.projects.entities[projectId]);

  const columns: KanbanColumnDef[] = useMemo(() => {
    if (project?.kanbanColumns && project.kanbanColumns.length > 0) {
      return project.kanbanColumns;
    }
    return DEFAULT_KANBAN_COLUMNS;
  }, [project?.kanbanColumns]);

  // Month Navigation State
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  
  // Create task modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedDueDate, setSelectedDueDate] = useState<string>('');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = addDays(startOfWeek(monthEnd), 6);
  
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Total tasks due this month
  const tasksThisMonth = useMemo(() => {
    return tasks.filter(t => t.dueDate && isSameMonth(new Date(t.dueDate), currentMonth));
  }, [tasks, currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  const handleDayAddClick = (e: React.MouseEvent, day: Date) => {
    e.stopPropagation();
    setSelectedDueDate(format(day, 'yyyy-MM-dd'));
    setCreateModalOpen(true);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-xs">
      {/* Calendar Header with Month Navigation */}
      <div className="flex flex-wrap items-center justify-between p-3.5 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 gap-2">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-xs"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-xs"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button
            onClick={handleToday}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shadow-xs"
          >
            Today
          </button>

          <h2 className="text-base font-bold text-gray-900 dark:text-white tracking-tight ml-1">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
        </div>

        <div className="flex items-center space-x-3 text-xs text-gray-500">
          <span className="flex items-center space-x-1 font-medium bg-gray-100 dark:bg-gray-800/80 px-2.5 py-1 rounded-full">
            <Clock size={12} className="text-blue-500" />
            <span>{tasksThisMonth.length} tasks scheduled this month</span>
          </span>
        </div>
      </div>

      {/* Scrollable Calendar Table Area */}
      <div className="overflow-x-auto flex-1 flex flex-col custom-scrollbar">
        <div className="min-w-[560px] flex-1 flex flex-col">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80 select-none">
            {weekDays.map(day => (
              <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Month Grid */}
          <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto min-h-0 divide-x divide-y divide-gray-100 dark:divide-gray-800/60">
            {days.map((day, i) => {
              const dayTasks = tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), day));
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isCurrentDay = isToday(day);
              
              return (
                <div 
                  key={day.toString()} 
                  className={`min-h-[110px] p-2 flex flex-col group transition-colors ${
                    !isCurrentMonth 
                      ? 'bg-gray-50/40 dark:bg-gray-900/20 text-gray-400' 
                      : 'bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 hover:bg-blue-50/10'
                  }`}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className={`text-xs font-medium ${
                      isCurrentDay 
                        ? 'flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-bold shadow-xs' 
                        : !isCurrentMonth ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {format(day, 'd')}
                    </div>

                    {/* Quick Add Task on hover */}
                    <button
                      onClick={(e) => handleDayAddClick(e, day)}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-400 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                      title={`Add task for ${format(day, 'MMM d')}`}
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  
                  {/* Tasks List */}
                  <div className="space-y-1 flex-1 overflow-y-auto max-h-[85px] pr-0.5 custom-scrollbar">
                    {dayTasks.slice(0, 3).map(task => {
                      const taskCol = columns.find(c => c.id === task.status);

                      return (
                        <div 
                          key={task.id}
                          onClick={() => onTaskClick(task.id)}
                          className="group/task truncate text-[11px] font-medium px-2 py-1 rounded-md border border-gray-200/70 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/80 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/60 dark:hover:bg-blue-950/40 cursor-pointer transition-all flex items-center space-x-1.5 shadow-2xs"
                          title={`${task.title} (${taskCol?.title || task.status})`}
                        >
                          <span 
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: taskCol?.color || '#3b82f6' }} 
                          />
                          <span className="truncate flex-1 text-gray-800 dark:text-gray-200">
                            {task.title}
                          </span>
                          {task.priority === 'urgent' && (
                            <Flag size={10} className="text-red-500 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}

                    {dayTasks.length > 3 && (
                      <div 
                        onClick={() => {
                          if (dayTasks[3]) onTaskClick(dayTasks[3].id);
                        }}
                        className="text-[10px] text-gray-500 hover:text-blue-600 font-semibold px-1.5 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors text-center"
                      >
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Create Task Modal prefilled with selected due date */}
      <CreateTaskModal
        isOpen={createModalOpen}
        onClose={() => {
          setCreateModalOpen(false);
          setSelectedDueDate('');
        }}
        projectId={projectId}
        initialDueDate={selectedDueDate}
      />
    </div>
  );
};

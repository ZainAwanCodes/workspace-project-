import React from 'react';
import { useAppSelector } from '@/lib/redux/hooks';
import { selectFilteredTasks } from '@/lib/redux/selectors/taskSelectors';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';

export const CalendarView = ({ projectId, onTaskClick }: { projectId: string; onTaskClick: (id: string) => void }) => {
  const tasks = useAppSelector(state => selectFilteredTasks(state, projectId));

  const currentDate = new Date(); // In real app, this would be state controlled
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = addDays(startOfWeek(monthEnd), 6);
  
  const dateFormat = "d";
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        {weekDays.map(day => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 overflow-y-auto">
        {days.map((day, i) => {
          const dayTasks = tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), day));
          const isCurrentMonth = isSameMonth(day, monthStart);
          
          return (
            <div 
              key={day.toString()} 
              className={`min-h-[100px] p-2 border-r border-b border-gray-100 dark:border-gray-800/50 ${
                !isCurrentMonth ? 'bg-gray-50 dark:bg-gray-900/30' : 'bg-white dark:bg-gray-950'
              } ${i % 7 === 6 ? 'border-r-0' : ''}`}
            >
              <div className={`text-xs font-medium mb-1 ${
                isSameDay(day, new Date()) 
                  ? 'flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white' 
                  : !isCurrentMonth ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'
              }`}>
                {format(day, dateFormat)}
              </div>
              
              <div className="space-y-1">
                {dayTasks.map(task => (
                  <div 
                    key={task.id}
                    onClick={() => onTaskClick(task.id)}
                    className="truncate text-[10px] font-medium px-1.5 py-1 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    {task.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

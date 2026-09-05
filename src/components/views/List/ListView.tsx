import React from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { updateTask } from '@/lib/redux/slices/taskSlice';
import { selectFilteredTasks } from '@/lib/redux/selectors/taskSelectors';
import { Task, TaskStatus } from '@/types/task';
import { format } from 'date-fns';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

export const ListView = ({ projectId, onTaskClick }: { projectId: string; onTaskClick: (id: string) => void }) => {
  const tasks = useAppSelector(state => selectFilteredTasks(state, projectId));
  
  const users = useAppSelector(state => state.auth.users);
  const dispatch = useAppDispatch();

  // Priority Colors
  const priorityColors = {
    low: 'bg-gray-100 text-gray-600',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  };

  const statusColors = {
    'todo': 'bg-gray-100 text-gray-600',
    'in-progress': 'bg-blue-100 text-blue-700',
    'review': 'bg-purple-100 text-purple-700',
    'done': 'bg-green-100 text-green-700',
  };

  const statusLabels = {
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'review': 'Review',
    'done': 'Done',
  };

  return (
    <div className="w-full h-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex flex-col">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-500 w-[40%]">Task Name</th>
              <th className="px-6 py-3 font-semibold text-gray-500 w-[15%]">Status</th>
              <th className="px-6 py-3 font-semibold text-gray-500 w-[15%]">Assignee</th>
              <th className="px-6 py-3 font-semibold text-gray-500 w-[15%]">Due Date</th>
              <th className="px-6 py-3 font-semibold text-gray-500 w-[15%]">Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No tasks found in this project.
                </td>
              </tr>
            ) : (
              tasks.map(task => {
                const assignee = users.find(u => u.id === task.assigneeId);
                return (
                  <tr 
                    key={task.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer transition-colors group"
                    onClick={() => onTaskClick(task.id)}
                  >
                    <td className="px-6 py-3">
                      <div className="font-medium text-gray-900 dark:text-white truncate">
                        {task.title}
                      </div>
                    </td>
                    <td className="px-6 py-3" onClick={e => e.stopPropagation()}>
                      <select 
                        value={task.status}
                        onChange={(e) => dispatch(updateTask({ id: task.id, changes: { status: e.target.value as TaskStatus } }))}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full border-none cursor-pointer focus:ring-0 ${statusColors[task.status]}`}
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="review">Review</option>
                        <option value="done">Done</option>
                      </select>
                    </td>
                    <td className="px-6 py-3">
                      {assignee ? (
                        <div className="flex items-center space-x-2">
                          <Avatar name={assignee.name} src={assignee.avatar} size="sm" />
                          <span className="text-gray-700 dark:text-gray-300">{assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-gray-600 dark:text-gray-400">
                      {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '-'}
                    </td>
                    <td className="px-6 py-3" onClick={e => e.stopPropagation()}>
                      <select 
                        value={task.priority}
                        onChange={(e) => dispatch(updateTask({ id: task.id, changes: { priority: e.target.value as any } }))}
                        className={`text-xs font-semibold uppercase px-2 py-1 rounded border-none cursor-pointer focus:ring-0 tracking-wider ${priorityColors[task.priority]}`}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

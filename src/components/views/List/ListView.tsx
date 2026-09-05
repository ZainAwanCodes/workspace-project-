import React from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { updateTask } from '@/lib/redux/slices/taskSlice';
import { logActivity } from '@/lib/redux/slices/activitySlice';
import { selectFilteredTasks } from '@/lib/redux/selectors/taskSelectors';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { format } from 'date-fns';
import { Avatar } from '@/components/ui/Avatar';
import { CheckSquare } from 'lucide-react';
import { nanoid } from '@reduxjs/toolkit';

export const ListView = ({ projectId, onTaskClick }: { projectId: string; onTaskClick: (id: string) => void }) => {
  const tasks = useAppSelector(state => selectFilteredTasks(state, projectId));
  const users = useAppSelector(state => state.auth.users);
  const currentUser = useAppSelector(state => state.auth.currentUser);
  const dispatch = useAppDispatch();

  // Priority Colors
  const priorityColors: Record<TaskPriority, string> = {
    low: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300',
    medium: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    high: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
    urgent: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
  };

  const statusColors: Record<TaskStatus, string> = {
    'todo': 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    'in-progress': 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    'review': 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
    'done': 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  };

  const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
    dispatch(updateTask({ id: task.id, changes: { status: newStatus } }));
    if (currentUser) {
      dispatch(logActivity({
        id: nanoid(),
        taskId: task.id,
        projectId: task.projectId,
        actorId: currentUser.id,
        action: 'status_changed',
        details: `Status changed to ${newStatus.replace('-', ' ')}`,
        createdAt: new Date().toISOString(),
      }));
    }
  };

  const handlePriorityChange = (task: Task, newPriority: TaskPriority) => {
    dispatch(updateTask({ id: task.id, changes: { priority: newPriority } }));
    if (currentUser) {
      dispatch(logActivity({
        id: nanoid(),
        taskId: task.id,
        projectId: task.projectId,
        actorId: currentUser.id,
        action: 'priority_changed',
        details: `Priority changed to ${newPriority}`,
        createdAt: new Date().toISOString(),
      }));
    }
  };

  return (
    <div className="w-full h-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex flex-col shadow-xs">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 font-semibold text-gray-500 w-[38%]">Task Name</th>
              <th className="px-6 py-3 font-semibold text-gray-500 w-[15%]">Status</th>
              <th className="px-6 py-3 font-semibold text-gray-500 w-[17%]">Assignee</th>
              <th className="px-6 py-3 font-semibold text-gray-500 w-[15%]">Due Date</th>
              <th className="px-6 py-3 font-semibold text-gray-500 w-[15%]">Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No tasks found in this project.
                </td>
              </tr>
            ) : (
              tasks.map(task => {
                const assignee = users.find(u => u.id === task.assigneeId);
                const completedSubtasks = task.subtasks?.filter(s => s.isCompleted).length || 0;
                const totalSubtasks = task.subtasks?.length || 0;

                return (
                  <tr 
                    key={task.id} 
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-900/50 cursor-pointer transition-colors group"
                    onClick={() => onTaskClick(task.id)}
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center space-x-2.5">
                        <span className="font-medium text-gray-900 dark:text-white truncate max-w-sm">
                          {task.title}
                        </span>
                        {totalSubtasks > 0 && (
                          <span className="inline-flex items-center text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                            <CheckSquare size={11} className="mr-1" />
                            {completedSubtasks}/{totalSubtasks}
                          </span>
                        )}
                        {task.labels && task.labels.length > 0 && (
                          <div className="hidden sm:flex items-center space-x-1">
                            {task.labels.slice(0, 2).map(l => (
                              <span key={l} className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded font-medium">
                                #{l}
                              </span>
                            ))}
                            {task.labels.length > 2 && (
                              <span className="text-[10px] text-gray-400">+{task.labels.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3" onClick={e => e.stopPropagation()}>
                      <select 
                        value={task.status}
                        onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
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
                          <Avatar name={assignee.name} src={assignee.avatar} size="xs" />
                          <span className="text-gray-700 dark:text-gray-300 text-xs font-medium">{assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-600 dark:text-gray-400">
                      {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '-'}
                    </td>
                    <td className="px-6 py-3" onClick={e => e.stopPropagation()}>
                      <select 
                        value={task.priority}
                        onChange={(e) => handlePriorityChange(task, e.target.value as TaskPriority)}
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

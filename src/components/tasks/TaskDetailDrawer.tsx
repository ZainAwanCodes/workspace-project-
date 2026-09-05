import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { Task, TaskStatus } from '@/types/task';
import { updateTask, removeTask, moveTaskStatus } from '@/lib/redux/slices/taskSlice';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Calendar, Trash2, Link, MessageSquare, Plus, CheckSquare, Clock, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { CommentThread } from './CommentThread';
import { ActivityFeed } from '../activity/ActivityFeed';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { SubtaskList } from './SubtaskList';

interface TaskDetailDrawerProps {
  taskId: string | null;
  onClose: () => void;
}

export const TaskDetailDrawer = ({ taskId, onClose }: TaskDetailDrawerProps) => {
  const dispatch = useAppDispatch();
  const task = useAppSelector(state => 
    taskId ? state.tasks.entities[taskId] : null
  ) as Task | null;
  const users = useAppSelector(state => state.auth.users);
  
  if (!task) return null;

  const assignee = users.find(u => u.id === task.assigneeId);

  const handleDelete = () => {
    dispatch(removeTask(task.id));
    onClose();
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(moveTaskStatus({ id: task.id, status: e.target.value as TaskStatus }));
  };

  return (
    <Drawer 
      isOpen={!!taskId} 
      onClose={onClose} 
      title={
        <div className="flex items-center text-sm font-normal text-gray-500">
          <span>{task.projectId}</span>
          <span className="mx-2">/</span>
          <span className="truncate max-w-[200px]">{task.title}</span>
        </div>
      }
      size="xl"
    >
      <div className="flex flex-col md:flex-row gap-6 h-full">
        {/* Main Content (Left) */}
        <div className="flex-1 space-y-6">
          
          {/* Title Edit */}
          <div>
            <input
              type="text"
              value={task.title}
              onChange={(e) => dispatch(updateTask({ id: task.id, changes: { title: e.target.value } }))}
              className="w-full text-2xl font-semibold bg-transparent border-none focus:ring-0 p-0 text-gray-900 dark:text-white placeholder-gray-400"
              placeholder="Task title"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
              <Link size={16} className="mr-2" /> Description
            </h3>
            <textarea
              value={task.description || ''}
              onChange={(e) => dispatch(updateTask({ id: task.id, changes: { description: e.target.value } }))}
              placeholder="Add a more detailed description..."
              className="w-full min-h-[120px] p-3 rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm focus:bg-white dark:focus:bg-gray-950 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y"
            />
          </div>

          {/* Subtasks */}
          <SubtaskList task={task} />

          {/* Activity / Comments Tabs */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
            <Tabs defaultValue="discussion">
              <TabsList>
                <TabsTrigger value="discussion"><MessageSquare size={14} className="mr-1.5 inline"/> Discussion</TabsTrigger>
                <TabsTrigger value="activity"><Activity size={14} className="mr-1.5 inline"/> Activity</TabsTrigger>
              </TabsList>
              
              <TabsContent value="discussion" className="mt-4">
                <CommentThread taskId={task.id} comments={task.comments || []} />
              </TabsContent>
              
              <TabsContent value="activity" className="mt-4">
                <ActivityFeed taskId={task.id} />
              </TabsContent>
            </Tabs>
          </div>

        </div>

        {/* Sidebar (Right) */}
        <div className="w-full md:w-64 space-y-6">
          
          <div className="space-y-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
              <select 
                value={task.status}
                onChange={handleStatusChange}
                className="w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-950"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Assignee</label>
              <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 p-1.5 -ml-1.5 rounded-md transition-colors">
                {assignee ? (
                  <><Avatar name={assignee.name} src={assignee.avatar} size="sm" /> <span className="text-sm font-medium">{assignee.name}</span></>
                ) : (
                  <><div className="w-6 h-6 rounded-full border border-dashed border-gray-400 flex items-center justify-center"><UserIcon size={12}/></div> <span className="text-sm text-gray-500">Unassigned</span></>
                )}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Due Date</label>
              <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 p-1.5 -ml-1.5 rounded-md transition-colors text-sm">
                <Calendar size={16} className="text-gray-400" />
                <span>{task.dueDate ? format(new Date(task.dueDate), 'PPP') : 'No due date'}</span>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Priority</label>
              <select 
                value={task.priority}
                onChange={(e) => dispatch(updateTask({ id: task.id, changes: { priority: e.target.value as any } }))}
                className="w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-950"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-200 dark:border-gray-800 pb-2">Actions</h4>
            <Button variant="outline" className="w-full justify-start text-gray-600 dark:text-gray-300">
              <Link size={14} className="mr-2" /> Copy Link
            </Button>
            <Button 
              variant="destructive" 
              className="w-full justify-start"
              onClick={handleDelete}
            >
              <Trash2 size={14} className="mr-2" /> Delete Task
            </Button>
          </div>

        </div>
      </div>
    </Drawer>
  );
};

// Temp mock for unassigned
const UserIcon = ({size}: {size:number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;

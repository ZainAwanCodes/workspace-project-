import React from 'react';
import { useAppSelector } from '@/lib/redux/hooks';
import { Avatar } from '../ui/Avatar';
import { formatDistanceToNow } from 'date-fns';

export const ActivityFeed = ({ taskId }: { taskId?: string }) => {
  const users = useAppSelector(state => state.auth.users);
  const activities = useAppSelector(state => {
    let all = state.activities.ids.map(id => state.activities.entities[id]!);
    if (taskId) {
      all = all.filter(a => a.taskId === taskId);
    }
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  if (activities.length === 0) {
    return <div className="text-sm text-gray-500 text-center py-4">No activity yet.</div>;
  }

  const getActionText = (action: string) => {
    switch (action) {
      case 'created':
        return 'created this task';
      case 'status_changed':
        return 'updated status';
      case 'priority_changed':
        return 'updated priority';
      case 'assigned':
        return 'updated assignee';
      case 'commented':
        return 'commented';
      case 'edited':
        return 'updated details';
      case 'subtask_updated':
        return 'updated subtasks';
      case 'attachment_added':
        return 'added an attachment';
      case 'deleted':
        return 'deleted';
      default:
        return action.replace('_', ' ');
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const actor = users.find(u => u.id === activity.actorId);
        
        return (
          <div key={activity.id} className="flex space-x-3 text-sm">
            {actor ? (
              <Avatar name={actor.name} src={actor.avatar} size="sm" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-800" />
            )}
            <div className="flex-1">
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {actor?.name || 'Unknown User'}
              </span>{' '}
              <span className="text-gray-500 dark:text-gray-400">
                {getActionText(activity.action)}
              </span>
              {' '}
              {activity.details && activity.action !== 'created' && (
                <span className="text-gray-800 dark:text-gray-200 font-medium">
                  {activity.details}
                </span>
              )}
              <div className="text-xs text-gray-400 mt-0.5">
                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

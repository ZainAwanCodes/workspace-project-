import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { logActivity } from '@/lib/redux/slices/activitySlice';
import { updateTask, addComment, updateSubtask } from '@/lib/redux/slices/taskSlice';
import { addNotification } from '@/lib/redux/slices/notificationSlice';
import { Avatar } from '@/components/ui/Avatar';
import { Dropdown, DropdownTrigger, DropdownContent } from '@/components/ui/Dropdown';
import { formatDistanceToNow } from 'date-fns';
import { nanoid } from '@reduxjs/toolkit';
import { 
  Radio, 
  Play, 
  Pause, 
  Sparkles, 
  ChevronDown, 
  History, 
  CheckCircle2, 
  MessageSquare, 
  ArrowRightCircle, 
  Flame,
  Activity as ActivityIcon
} from 'lucide-react';

const SIMULATED_COMMENTS = [
  "Reviewed the latest draft, looks ready to ship! 🚀",
  "Pushed test coverage up to 94% on this module.",
  "Updated documentation with API sample payloads.",
  "Verified on staging environment; performance is snappy.",
  "Addresses the user feedback from this morning's sync.",
  "Refactored data loading to prevent layout shifts.",
  "Synced with product design on the updated colors."
];

export const ActivityTicker: React.FC = () => {
  const dispatch = useAppDispatch();
  const activities = useAppSelector(state => 
    state.activities.ids.map(id => state.activities.entities[id]!).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  );
  const tasks = useAppSelector(state => Object.values(state.tasks.entities).filter(Boolean));
  const users = useAppSelector(state => state.auth.users);
  const currentUser = useAppSelector(state => state.auth.currentUser);

  const [isSimulating, setIsSimulating] = useState(true);
  const [activeActivityIndex, setActiveActivityIndex] = useState(0);
  const [pulseGlow, setPulseGlow] = useState(false);

  // Available teammates (exclude current logged in user)
  const teammates = useMemo(() => {
    if (!currentUser) return users;
    const filtered = users.filter(u => u.id !== currentUser.id);
    return filtered.length > 0 ? filtered : users;
  }, [users, currentUser]);

  // Execute a simulated background event
  const triggerSimulation = () => {
    if (tasks.length === 0 || teammates.length === 0) return;

    // Pick random teammate and random task
    const randomTeammate = teammates[Math.floor(Math.random() * teammates.length)];
    const randomTask = tasks[Math.floor(Math.random() * tasks.length)];
    const actionTypes = ['status', 'subtask', 'comment', 'priority'];
    const chosenAction = actionTypes[Math.floor(Math.random() * actionTypes.length)];

    const now = new Date().toISOString();

    if (chosenAction === 'status') {
      const statuses = ['todo', 'in-progress', 'review', 'done'];
      const currentIdx = statuses.indexOf(randomTask.status);
      const nextStatus = statuses[(currentIdx + 1) % statuses.length];
      const statusLabels: Record<string, string> = {
        todo: 'To Do',
        'in-progress': 'In Progress',
        review: 'In Review',
        done: 'Done'
      };

      dispatch(updateTask({
        id: randomTask.id,
        changes: { status: nextStatus, updatedAt: now }
      }));

      dispatch(logActivity({
        id: nanoid(),
        taskId: randomTask.id,
        projectId: randomTask.projectId,
        actorId: randomTeammate.id,
        action: 'status_changed',
        details: `moved "${randomTask.title}" to ${statusLabels[nextStatus] || nextStatus}`,
        createdAt: now,
      }));

      // Notify if currentUser is assigned to this task
      if (currentUser && randomTask.assigneeId === currentUser.id) {
        dispatch(addNotification({
          id: nanoid(),
          userId: currentUser.id,
          type: 'assigned',
          message: `${randomTeammate.name} moved your task "${randomTask.title}" to ${statusLabels[nextStatus] || nextStatus}`,
          isRead: false,
          taskId: randomTask.id,
          createdAt: now,
        }));
      }
    } else if (chosenAction === 'subtask' && randomTask.subtasks && randomTask.subtasks.length > 0) {
      // Pick random subtask and toggle completion
      const subtask = randomTask.subtasks[Math.floor(Math.random() * randomTask.subtasks.length)];
      const nextState = !subtask.isCompleted;

      dispatch(updateSubtask({
        taskId: randomTask.id,
        subtaskId: subtask.id,
        changes: { isCompleted: nextState }
      }));

      dispatch(logActivity({
        id: nanoid(),
        taskId: randomTask.id,
        projectId: randomTask.projectId,
        actorId: randomTeammate.id,
        action: 'subtask_updated',
        details: `${nextState ? 'completed' : 'reopened'} subtask "${subtask.title}" on "${randomTask.title}"`,
        createdAt: now,
      }));
    } else if (chosenAction === 'comment') {
      const commentText = SIMULATED_COMMENTS[Math.floor(Math.random() * SIMULATED_COMMENTS.length)];
      
      dispatch(addComment({
        taskId: randomTask.id,
        comment: {
          id: nanoid(),
          taskId: randomTask.id,
          authorId: randomTeammate.id,
          content: commentText,
          createdAt: now,
        }
      }));

      dispatch(logActivity({
        id: nanoid(),
        taskId: randomTask.id,
        projectId: randomTask.projectId,
        actorId: randomTeammate.id,
        action: 'commented',
        details: `commented on "${randomTask.title}": "${commentText.slice(0, 30)}..."`,
        createdAt: now,
      }));

      if (currentUser && randomTask.assigneeId === currentUser.id) {
        dispatch(addNotification({
          id: nanoid(),
          userId: currentUser.id,
          type: 'mentioned',
          message: `${randomTeammate.name} commented on your task "${randomTask.title}"`,
          isRead: false,
          taskId: randomTask.id,
          createdAt: now,
        }));
      }
    } else {
      // Priority update
      const priorities: ('low' | 'medium' | 'high' | 'urgent')[] = ['low', 'medium', 'high', 'urgent'];
      const nextPriority = priorities[Math.floor(Math.random() * priorities.length)];

      dispatch(updateTask({
        id: randomTask.id,
        changes: { priority: nextPriority, updatedAt: now }
      }));

      dispatch(logActivity({
        id: nanoid(),
        taskId: randomTask.id,
        projectId: randomTask.projectId,
        actorId: randomTeammate.id,
        action: 'priority_changed',
        details: `changed priority of "${randomTask.title}" to ${nextPriority.toUpperCase()}`,
        createdAt: now,
      }));
    }

    // Flash visual ticker pulse
    setPulseGlow(true);
    setTimeout(() => setPulseGlow(false), 1200);
  };

  // Background timer for continuous simulated updates (every 22 seconds)
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      triggerSimulation();
    }, 22000);

    return () => clearInterval(interval);
  }, [isSimulating, tasks, teammates, currentUser]);

  // Auto-cycle through the recent activities for display in the ticker every 6 seconds
  useEffect(() => {
    if (activities.length <= 1) return;

    const cycleInterval = setInterval(() => {
      setActiveActivityIndex(prev => (prev + 1) % Math.min(activities.length, 8));
    }, 6000);

    return () => clearInterval(cycleInterval);
  }, [activities.length]);

  const currentActivity = activities[activeActivityIndex] || activities[0];
  const actor = currentActivity ? users.find(u => u.id === currentActivity.actorId) : null;

  return (
    <div className="flex items-center space-x-2">
      {/* Interactive Ticker Dropdown */}
      <Dropdown>
        <DropdownTrigger>
          <div 
            className={`flex items-center space-x-2 px-2.5 py-1 rounded-full border text-xs cursor-pointer select-none transition-all duration-300 ${
              pulseGlow 
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-600 shadow-sm ring-2 ring-emerald-400/30' 
                : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
            }`}
            title="Click to view live team activity stream"
          >
            {/* Pulsing Live Dot */}
            <span className="relative flex h-2 w-2">
              {isSimulating && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isSimulating ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
            </span>

            <span className="font-semibold text-[10px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hidden xl:inline">
              Live Ticker
            </span>

            {/* Cycling Activity Content */}
            {currentActivity && actor ? (
              <div className="flex items-center space-x-1.5 max-w-[200px] sm:max-w-[280px] md:max-w-[340px] truncate">
                <Avatar name={actor.name} src={actor.avatar} size="xs" />
                <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {actor.name.split(' ')[0]}:
                </span>
                <span className="text-gray-500 dark:text-gray-400 truncate">
                  {currentActivity.details || currentActivity.action.replace('_', ' ')}
                </span>
                <span className="text-[10px] text-gray-400 ml-1 hidden md:inline">
                  • {formatDistanceToNow(new Date(currentActivity.createdAt), { addSuffix: false })}
                </span>
              </div>
            ) : (
              <span className="text-gray-500 text-xs">Waiting for team activity...</span>
            )}

            <ChevronDown size={12} className="text-gray-400 ml-0.5" />
          </div>
        </DropdownTrigger>

        {/* Expanded Activity Stream Menu */}
        <DropdownContent align="right" className="w-88 sm:w-96 p-0 overflow-hidden shadow-2xl">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/60 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ActivityIcon size={16} className="text-emerald-500" />
              <div>
                <h4 className="font-semibold text-xs text-gray-900 dark:text-white">Live Activity Feed</h4>
                <p className="text-[10px] text-gray-500">Real-time team collaboration ticker</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerSimulation();
                }}
                className="flex items-center space-x-1 px-2 py-1 text-[11px] font-medium rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs"
                title="Trigger simulated teammate action now"
              >
                <Sparkles size={11} />
                <span>Simulate</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSimulating(!isSimulating);
                }}
                className={`p-1.5 rounded-md border text-xs transition-colors ${
                  isSimulating 
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700'
                }`}
                title={isSimulating ? 'Pause background simulation' : 'Resume background simulation'}
              >
                {isSimulating ? <Pause size={12} /> : <Play size={12} />}
              </button>
            </div>
          </div>

          {/* Activity Stream List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
            {activities.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400">
                No activity logged yet. Click "Simulate" to create team actions!
              </div>
            ) : (
              activities.slice(0, 15).map((act) => {
                const actActor = users.find(u => u.id === act.actorId);
                return (
                  <div key={act.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors flex items-start space-x-2.5">
                    {actActor ? (
                      <Avatar name={actActor.name} src={actActor.avatar} size="xs" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700" />
                    )}
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                          {actActor?.name || 'Teammate'}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mt-0.5 leading-snug">
                        {act.details || act.action.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900/80 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400 flex items-center justify-between">
            <span>Status: {isSimulating ? 'Active background simulation' : 'Simulation paused'}</span>
            <span>{activities.length} total events</span>
          </div>
        </DropdownContent>
      </Dropdown>

      {/* Quick Play/Pause & Trigger Button on large displays */}
      <div className="hidden lg:flex items-center space-x-1">
        <button
          onClick={triggerSimulation}
          className="p-1.5 text-gray-400 hover:text-emerald-500 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Simulate teammate action now"
        >
          <Sparkles size={14} />
        </button>
      </div>
    </div>
  );
};

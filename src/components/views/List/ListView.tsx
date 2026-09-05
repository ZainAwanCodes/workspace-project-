import React, { useState, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { updateTask } from '@/lib/redux/slices/taskSlice';
import { logActivity } from '@/lib/redux/slices/activitySlice';
import { setGroupBy, toggleTaskSelection, selectAllTasks, deselectTasks } from '@/lib/redux/slices/uiSlice';
import { selectFilteredTasks } from '@/lib/redux/selectors/taskSelectors';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { DEFAULT_KANBAN_COLUMNS, KanbanColumnDef } from '@/types/project';
import { format } from 'date-fns';
import { Avatar } from '@/components/ui/Avatar';
import { 
  CheckSquare, 
  ArrowUp, 
  ArrowDown, 
  ArrowUpDown, 
  ChevronDown, 
  ChevronRight, 
  Layers, 
  Plus, 
  X, 
  Flag, 
  User as UserIcon,
  ChevronsUpDown,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from '@/components/ui/Dropdown';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { nanoid } from '@reduxjs/toolkit';

type SortField = 'title' | 'status' | 'assignee' | 'dueDate' | 'priority';
type SortDirection = 'asc' | 'desc';
type GroupByType = 'none' | 'status' | 'priority' | 'assignee';

export const ListView = ({ projectId, onTaskClick }: { projectId: string; onTaskClick: (id: string) => void }) => {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(state => selectFilteredTasks(state, projectId));
  const users = useAppSelector(state => state.auth.users);
  const currentUser = useAppSelector(state => state.auth.currentUser);
  const reduxGroupBy = useAppSelector(state => state.ui.groupBy);
  const project = useAppSelector(state => state.projects.entities[projectId]);

  const columns: KanbanColumnDef[] = useMemo(() => {
    if (project?.kanbanColumns && project.kanbanColumns.length > 0) {
      return project.kanbanColumns;
    }
    return DEFAULT_KANBAN_COLUMNS;
  }, [project?.kanbanColumns]);

  // Sorting State
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Group By State (syncs with Redux uiSlice)
  const activeGroupBy: GroupByType = useMemo(() => {
    if (['status', 'priority', 'assignee'].includes(reduxGroupBy)) {
      return reduxGroupBy as GroupByType;
    }
    return 'none';
  }, [reduxGroupBy]);

  // Collapsed Groups State
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // Create Task Modal from Group
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [initialGroupStatus, setInitialGroupStatus] = useState<TaskStatus>('todo');

  // Multi-select state
  const selectedTaskIds = useAppSelector(state => state.ui.selectedTaskIds);
  const visibleTaskIds = useMemo(() => tasks.map(t => t.id), [tasks]);
  const isAllSelected = useMemo(() => {
    return visibleTaskIds.length > 0 && visibleTaskIds.every(id => selectedTaskIds.includes(id));
  }, [visibleTaskIds, selectedTaskIds]);
  const isSomeSelected = useMemo(() => {
    return visibleTaskIds.some(id => selectedTaskIds.includes(id)) && !isAllSelected;
  }, [visibleTaskIds, selectedTaskIds, isAllSelected]);

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      dispatch(deselectTasks(visibleTaskIds));
    } else {
      dispatch(selectAllTasks(visibleTaskIds));
    }
  };

  const priorityColors: Record<TaskPriority, string> = {
    low: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300',
    medium: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    high: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
    urgent: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300',
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

  // Header click handler for sorting
  const handleSortClick = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortField(null);
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort tasks function
  const sortTaskList = (list: Task[]) => {
    if (!sortField) return list;

    return [...list].sort((a, b) => {
      let cmp = 0;
      if (sortField === 'title') {
        cmp = a.title.localeCompare(b.title);
      } else if (sortField === 'status') {
        const aIndex = columns.findIndex(c => c.id === a.status);
        const bIndex = columns.findIndex(c => c.id === b.status);
        cmp = aIndex - bIndex;
      } else if (sortField === 'assignee') {
        const nameA = users.find(u => u.id === a.assigneeId)?.name || 'zzz';
        const nameB = users.find(u => u.id === b.assigneeId)?.name || 'zzz';
        cmp = nameA.localeCompare(nameB);
      } else if (sortField === 'dueDate') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        cmp = dateA - dateB;
      } else if (sortField === 'priority') {
        const priorityWeight: Record<TaskPriority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        cmp = (priorityWeight[a.priority] || 0) - (priorityWeight[b.priority] || 0);
      }
      return sortDirection === 'desc' ? -cmp : cmp;
    });
  };

  // Grouping logic
  interface GroupDefinition {
    id: string;
    title: string;
    icon?: React.ReactNode;
    color?: string;
    tasks: Task[];
    defaultStatus?: TaskStatus;
  }

  const groups: GroupDefinition[] = useMemo(() => {
    if (activeGroupBy === 'none') {
      return [
        {
          id: 'all',
          title: 'All Tasks',
          tasks: sortTaskList(tasks),
        },
      ];
    }

    if (activeGroupBy === 'status') {
      return columns.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id);
        return {
          id: col.id,
          title: col.title,
          color: col.color,
          tasks: sortTaskList(colTasks),
          defaultStatus: col.id,
        };
      });
    }

    if (activeGroupBy === 'priority') {
      const priorityOrder: { id: TaskPriority; title: string; color: string }[] = [
        { id: 'urgent', title: 'Urgent Priority', color: '#ef4444' },
        { id: 'high', title: 'High Priority', color: '#f97316' },
        { id: 'medium', title: 'Medium Priority', color: '#3b82f6' },
        { id: 'low', title: 'Low Priority', color: '#6b7280' },
      ];

      return priorityOrder.map(p => {
        const pTasks = tasks.filter(t => t.priority === p.id);
        return {
          id: p.id,
          title: p.title,
          color: p.color,
          tasks: sortTaskList(pTasks),
          icon: <Flag size={13} style={{ color: p.color }} />,
        };
      });
    }

    if (activeGroupBy === 'assignee') {
      const grouped: GroupDefinition[] = [];

      // Assigned users
      users.forEach(user => {
        const userTasks = tasks.filter(t => t.assigneeId === user.id);
        if (userTasks.length > 0 || project?.memberIds?.includes(user.id)) {
          grouped.push({
            id: user.id,
            title: user.name,
            tasks: sortTaskList(userTasks),
            icon: <Avatar name={user.name} src={user.avatar} size="xs" />,
          });
        }
      });

      // Unassigned
      const unassignedTasks = tasks.filter(t => !t.assigneeId);
      grouped.push({
        id: 'unassigned',
        title: 'Unassigned',
        tasks: sortTaskList(unassignedTasks),
        icon: <UserIcon size={13} className="text-gray-400" />,
      });

      return grouped;
    }

    return [{ id: 'all', title: 'All Tasks', tasks: sortTaskList(tasks) }];
  }, [activeGroupBy, tasks, columns, users, project?.memberIds, sortField, sortDirection]);

  // Toggle group collapse
  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const expandAll = () => setCollapsedGroups({});
  const collapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    groups.forEach(g => {
      allCollapsed[g.id] = true;
    });
    setCollapsedGroups(allCollapsed);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-60 text-gray-400 transition-opacity" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={12} className="text-blue-600 dark:text-blue-400 font-bold" />
    ) : (
      <ArrowDown size={12} className="text-blue-600 dark:text-blue-400 font-bold" />
    );
  };

  return (
    <div className="w-full h-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden flex flex-col shadow-xs">
      {/* List View Toolbar */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/40 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2">
          {/* Group By Dropdown */}
          <Dropdown>
            <DropdownTrigger>
              <button className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 shadow-xs transition-colors">
                <Layers size={13} className="text-gray-500" />
                <span>Group by:</span>
                <span className="font-semibold capitalize text-blue-600 dark:text-blue-400">
                  {activeGroupBy}
                </span>
                <ChevronsUpDown size={12} className="text-gray-400 ml-0.5" />
              </button>
            </DropdownTrigger>
            <DropdownContent align="left" className="w-44">
              <DropdownItem onClick={() => dispatch(setGroupBy('none'))}>
                <span className={activeGroupBy === 'none' ? 'font-semibold text-blue-600' : ''}>None (Flat List)</span>
              </DropdownItem>
              <DropdownItem onClick={() => dispatch(setGroupBy('status'))}>
                <span className={activeGroupBy === 'status' ? 'font-semibold text-blue-600' : ''}>Status</span>
              </DropdownItem>
              <DropdownItem onClick={() => dispatch(setGroupBy('priority'))}>
                <span className={activeGroupBy === 'priority' ? 'font-semibold text-blue-600' : ''}>Priority</span>
              </DropdownItem>
              <DropdownItem onClick={() => dispatch(setGroupBy('assignee'))}>
                <span className={activeGroupBy === 'assignee' ? 'font-semibold text-blue-600' : ''}>Assignee</span>
              </DropdownItem>
            </DropdownContent>
          </Dropdown>

          {/* Active Sort Tag & Reset */}
          {sortField && (
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-700 dark:text-blue-300">
              <span className="font-medium">
                Sorted by {sortField === 'dueDate' ? 'Due Date' : sortField.charAt(0).toUpperCase() + sortField.slice(1)} ({sortDirection === 'asc' ? 'Asc' : 'Desc'})
              </span>
              <button
                onClick={() => setSortField(null)}
                className="hover:text-red-500 p-0.5 rounded transition-colors"
                title="Clear sorting"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Right side tools */}
        <div className="flex items-center space-x-2">
          {activeGroupBy !== 'none' && (
            <div className="flex items-center space-x-1 border-r border-gray-200 dark:border-gray-800 pr-2">
              <button
                onClick={expandAll}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Expand all groups"
              >
                <Maximize2 size={12} />
                <span>Expand All</span>
              </button>
              <button
                onClick={collapseAll}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Collapse all groups"
              >
                <Minimize2 size={12} />
                <span>Collapse All</span>
              </button>
            </div>
          )}

          <span className="text-xs text-gray-500 font-medium">
            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50/90 dark:bg-gray-900/90 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10 text-xs uppercase tracking-wider select-none">
            <tr>
              {/* Select All Checkbox */}
              <th className="pl-4 pr-1 py-3 w-[40px] text-center">
                <input 
                  type="checkbox" 
                  checked={isAllSelected}
                  ref={el => {
                    if (el) el.indeterminate = isSomeSelected;
                  }}
                  onChange={handleSelectAllToggle}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  title={isAllSelected ? "Deselect all" : "Select all"}
                />
              </th>

              <th 
                onClick={() => handleSortClick('title')}
                className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 w-[36%] cursor-pointer hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors group"
              >
                <div className="flex items-center space-x-1.5">
                  <span>Task Name</span>
                  {getSortIcon('title')}
                </div>
              </th>

              <th 
                onClick={() => handleSortClick('status')}
                className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400 w-[15%] cursor-pointer hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors group"
              >
                <div className="flex items-center space-x-1.5">
                  <span>Status</span>
                  {getSortIcon('status')}
                </div>
              </th>

              <th 
                onClick={() => handleSortClick('assignee')}
                className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400 w-[17%] cursor-pointer hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors group"
              >
                <div className="flex items-center space-x-1.5">
                  <span>Assignee</span>
                  {getSortIcon('assignee')}
                </div>
              </th>

              <th 
                onClick={() => handleSortClick('dueDate')}
                className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400 w-[15%] cursor-pointer hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors group"
              >
                <div className="flex items-center space-x-1.5">
                  <span>Due Date</span>
                  {getSortIcon('dueDate')}
                </div>
              </th>

              <th 
                onClick={() => handleSortClick('priority')}
                className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400 w-[15%] cursor-pointer hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors group"
              >
                <div className="flex items-center space-x-1.5">
                  <span>Priority</span>
                  {getSortIcon('priority')}
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                  <p className="text-sm font-medium">No tasks found matching current filters.</p>
                </td>
              </tr>
            ) : (
              groups.map(group => {
                const isCollapsed = collapsedGroups[group.id];

                return (
                  <React.Fragment key={group.id}>
                    {/* Group Header Row (only when grouped) */}
                    {activeGroupBy !== 'none' && (
                      <tr className="bg-gray-50/70 dark:bg-gray-900/60 border-t border-b border-gray-200/70 dark:border-gray-800/70 select-none">
                        <td colSpan={6} className="px-4 py-2">
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => toggleGroup(group.id)}
                              className="flex items-center space-x-2 text-left font-semibold text-xs text-gray-800 dark:text-gray-200 hover:text-blue-600 transition-colors"
                            >
                              <span className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800">
                                {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                              </span>

                              {group.color && (
                                <span
                                  className="w-2.5 h-2.5 rounded-full ring-1 ring-black/10 dark:ring-white/10"
                                  style={{ backgroundColor: group.color }}
                                />
                              )}
                              {group.icon && <span>{group.icon}</span>}

                              <span>{group.title}</span>
                              <span className="bg-gray-200/80 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[11px] font-normal px-2 py-0.5 rounded-full">
                                {group.tasks.length}
                              </span>
                            </button>

                            <button
                              onClick={() => {
                                setInitialGroupStatus(group.defaultStatus || 'todo');
                                setCreateModalOpen(true);
                              }}
                              className="flex items-center space-x-1 text-[11px] text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 px-2 py-0.5 rounded hover:bg-gray-200/60 dark:hover:bg-gray-800 transition-colors"
                              title={`Add task to ${group.title}`}
                            >
                              <Plus size={12} />
                              <span>Add Task</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Group Task Rows */}
                    {!isCollapsed && group.tasks.length === 0 && activeGroupBy !== 'none' && (
                      <tr>
                        <td colSpan={6} className="px-8 py-3 text-xs text-gray-400 italic bg-white dark:bg-gray-950">
                          No tasks in this group.
                        </td>
                      </tr>
                    )}

                    {!isCollapsed &&
                      group.tasks.map(task => {
                        const isSelected = selectedTaskIds.includes(task.id);
                        const assignee = users.find(u => u.id === task.assigneeId);
                        const completedSubtasks = task.subtasks?.filter(s => s.isCompleted).length || 0;
                        const totalSubtasks = task.subtasks?.length || 0;
                        const taskCol = columns.find(c => c.id === task.status);

                        return (
                          <tr
                            key={task.id}
                            className={`${
                              isSelected 
                                ? 'bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-inset ring-blue-500/30' 
                                : 'hover:bg-gray-50/90 dark:hover:bg-gray-900/60'
                            } cursor-pointer transition-colors group`}
                            onClick={() => onTaskClick(task.id)}
                          >
                            {/* Checkbox */}
                            <td className="pl-4 pr-1 py-3 w-[40px] text-center" onClick={e => e.stopPropagation()}>
                              <input 
                                type="checkbox" 
                                checked={isSelected}
                                onChange={() => dispatch(toggleTaskSelection(task.id))}
                                className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                            </td>

                            {/* Task Name */}
                            <td className="px-4 py-3">
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
                                      <span
                                        key={l}
                                        className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-1.5 py-0.5 rounded font-medium"
                                      >
                                        #{l}
                                      </span>
                                    ))}
                                    {task.labels.length > 2 && (
                                      <span className="text-[10px] text-gray-400">
                                        +{task.labels.length - 2}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Status Select */}
                            <td className="px-6 py-3" onClick={e => e.stopPropagation()}>
                              <div className="flex items-center space-x-1.5">
                                <span
                                  className="w-2 h-2 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: taskCol?.color || '#64748b' }}
                                />
                                <select
                                  value={task.status}
                                  onChange={e => handleStatusChange(task, e.target.value as TaskStatus)}
                                  className="text-xs font-medium px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 cursor-pointer focus:ring-1 focus:ring-blue-500"
                                >
                                  {columns.map(c => (
                                    <option key={c.id} value={c.id}>
                                      {c.title}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </td>

                            {/* Assignee */}
                            <td className="px-6 py-3">
                              {assignee ? (
                                <div className="flex items-center space-x-2">
                                  <Avatar name={assignee.name} src={assignee.avatar} size="xs" />
                                  <span className="text-gray-700 dark:text-gray-300 text-xs font-medium">
                                    {assignee.name}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs italic">Unassigned</span>
                              )}
                            </td>

                            {/* Due Date */}
                            <td className="px-6 py-3 text-xs text-gray-600 dark:text-gray-400">
                              {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '-'}
                            </td>

                            {/* Priority Select */}
                            <td className="px-6 py-3" onClick={e => e.stopPropagation()}>
                              <select
                                value={task.priority}
                                onChange={e => handlePriorityChange(task, e.target.value as TaskPriority)}
                                className={`text-xs font-semibold uppercase px-2 py-0.5 rounded border-none cursor-pointer focus:ring-0 tracking-wider ${priorityColors[task.priority]}`}
                              >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Create Task Modal from Group Action */}
      <CreateTaskModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        projectId={projectId}
        initialStatus={initialGroupStatus}
      />
    </div>
  );
};

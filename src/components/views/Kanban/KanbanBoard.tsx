import React, { useMemo, useState } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { 
  SortableContext, 
  arrayMove, 
  sortableKeyboardCoordinates, 
  horizontalListSortingStrategy 
} from '@dnd-kit/sortable';
import { Task, TaskStatus } from '@/types/task';
import { KanbanColumnDef, DEFAULT_KANBAN_COLUMNS } from '@/types/project';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { moveTaskStatus } from '@/lib/redux/slices/taskSlice';
import { 
  setProjectColumns, 
  addProjectColumn, 
  updateProjectColumn, 
  removeProjectColumn 
} from '@/lib/redux/slices/projectSlice';
import { selectFilteredTasks } from '@/lib/redux/selectors/taskSelectors';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskDetailDrawer } from '@/components/tasks/TaskDetailDrawer';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { Plus, Check, X } from 'lucide-react';
import { nanoid } from '@reduxjs/toolkit';

import { useUndoRedo } from '@/hooks/useUndoRedo';

const PRESET_COLORS = [
  { label: 'Slate', value: '#64748b' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Purple', value: '#8b5cf6' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Rose', value: '#f43f5e' },
  { label: 'Cyan', value: '#06b6d4' },
];

export const KanbanBoard = ({ projectId, readOnly = false }: { projectId: string; readOnly?: boolean }) => {
  const dispatch = useAppDispatch();
  const project = useAppSelector(state => state.projects.entities[projectId]);
  const tasks = useAppSelector(state => selectFilteredTasks(state, projectId));
  const allTasks = useAppSelector(state => state.tasks.entities);
  const { trackAction } = useUndoRedo();

  // Resolved columns (project custom columns or default columns)
  const columns: KanbanColumnDef[] = useMemo(() => {
    if (project?.kanbanColumns && project.kanbanColumns.length > 0) {
      return project.kanbanColumns;
    }
    return DEFAULT_KANBAN_COLUMNS;
  }, [project?.kanbanColumns]);

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [initialStatus, setInitialStatus] = useState<TaskStatus>('todo');

  const draggedTaskInitialSnapshot = React.useRef<Task | null>(null);

  // Add Column Form State
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [newColumnColor, setNewColumnColor] = useState('#3b82f6');

  const activeTask = useMemo(() => tasks.find((t) => t.id === activeTaskId), [activeTaskId, tasks]);
  const activeColumn = useMemo(() => columns.find((c) => c.id === activeColumnId), [activeColumnId, columns]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeSensors = readOnly ? [] : sensors;

  const onDragStart = (event: DragStartEvent) => {
    if (readOnly) return;
    const type = event.active.data.current?.type;
    if (type === 'Column') {
      setActiveColumnId(event.active.id as string);
    } else {
      const task = event.active.data.current?.task as Task;
      if (task) {
        draggedTaskInitialSnapshot.current = { ...task };
      }
      setActiveTaskId(event.active.id as string);
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    if (readOnly) return;
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    // Dropping a task over another task
    if (isActiveTask && isOverTask) {
      const activeTaskData = active.data.current?.task as Task;
      const overTaskData = over.data.current?.task as Task;

      if (activeTaskData.status !== overTaskData.status) {
        dispatch(moveTaskStatus({ id: activeTaskData.id, status: overTaskData.status }));
      }
    }

    // Dropping a task over a column
    if (isActiveTask && isOverColumn) {
      const activeTaskData = active.data.current?.task as Task;
      const targetColumn = over.data.current?.status || over.id as TaskStatus;
      
      if (activeTaskData.status !== targetColumn) {
        dispatch(moveTaskStatus({ id: activeTaskData.id, status: targetColumn }));
      }
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.data.current?.type === 'Column' && over) {
      if (active.id !== over.id) {
        const oldIndex = columns.findIndex(c => c.id === active.id);
        const newIndex = columns.findIndex(c => c.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          const reordered = arrayMove(columns, oldIndex, newIndex);
          dispatch(setProjectColumns({ projectId, columns: reordered }));
        }
      }
    }

    // Check if task status changed during drag
    if (active.data.current?.type === 'Task' && activeTaskId && draggedTaskInitialSnapshot.current) {
      const initialTask = draggedTaskInitialSnapshot.current;
      const currentTask = allTasks[activeTaskId];
      if (currentTask && currentTask.status !== initialTask.status) {
        const colTitle = columns.find(c => c.id === currentTask.status)?.title || currentTask.status;
        trackAction({
          description: `Moved "${currentTask.title}" to ${colTitle}`,
          previousTasks: [initialTask],
          nextTasks: [currentTask],
        });
      }
    }

    draggedTaskInitialSnapshot.current = null;
    setActiveTaskId(null);
    setActiveColumnId(null);
  };

  // Column Manipulation Handlers
  const handleMoveColumn = (columnId: string, direction: 'left' | 'right') => {
    const index = columns.findIndex(c => c.id === columnId);
    if (index === -1) return;
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= columns.length) return;
    const reordered = arrayMove(columns, index, targetIndex);
    dispatch(setProjectColumns({ projectId, columns: reordered }));
  };

  const handleRenameColumn = (columnId: string, newTitle: string) => {
    dispatch(updateProjectColumn({ projectId, columnId, changes: { title: newTitle } }));
  };

  const handleChangeColumnColor = (columnId: string, color: string) => {
    dispatch(updateProjectColumn({ projectId, columnId, changes: { color } }));
  };

  const handleDeleteColumn = (columnId: string) => {
    if (columns.length <= 1) return;
    // Find fallback column for orphaned tasks
    const fallbackColumn = columns.find(c => c.id !== columnId) || columns[0];
    const tasksToReassign = tasks.filter(t => t.status === columnId);
    tasksToReassign.forEach(t => {
      dispatch(moveTaskStatus({ id: t.id, status: fallbackColumn.id }));
    });
    dispatch(removeProjectColumn({ projectId, columnId }));
  };

  const handleCreateColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;

    const columnId = `col-${nanoid(6)}`;
    dispatch(addProjectColumn({
      projectId,
      column: {
        id: columnId,
        title: newColumnTitle.trim(),
        color: newColumnColor,
      }
    }));

    setNewColumnTitle('');
    setIsAddingColumn(false);
  };

  return (
    <>
      <div className="h-full w-full flex overflow-x-auto pb-4 gap-6 items-start">
        <DndContext
          sensors={activeSensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          <SortableContext items={columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
            {columns.map((col, index) => (
              <KanbanColumn 
                key={col.id} 
                column={col}
                index={index}
                totalColumns={columns.length}
                tasks={tasks.filter(t => t.status === col.id)} 
                onTaskClick={(taskId) => setSelectedTaskId(taskId)}
                onAddTask={readOnly ? undefined : (status) => {
                  setInitialStatus(status);
                  setCreateModalOpen(true);
                }}
                onMoveColumn={readOnly ? undefined : (dir) => handleMoveColumn(col.id, dir)}
                onRenameColumn={readOnly ? undefined : (title) => handleRenameColumn(col.id, title)}
                onChangeColor={readOnly ? undefined : (color) => handleChangeColumnColor(col.id, color)}
                onDeleteColumn={readOnly ? undefined : () => handleDeleteColumn(col.id)}
                canDelete={columns.length > 1}
                readOnly={readOnly}
              />
            ))}
          </SortableContext>

          {/* Add Column Card */}
          {!readOnly && (
            <div className="flex-shrink-0 w-[280px]">
              {isAddingColumn ? (
                <form 
                  onSubmit={handleCreateColumn}
                  className="bg-white dark:bg-gray-900 p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-3"
                >
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Column Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Blocked, Testing, Backlog"
                      value={newColumnTitle}
                      onChange={(e) => setNewColumnTitle(e.target.value)}
                      autoFocus
                      className="w-full text-sm px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                      Column Color
                    </label>
                    <div className="flex items-center space-x-2">
                      {PRESET_COLORS.map(c => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => setNewColumnColor(c.value)}
                          className={`w-5 h-5 rounded-full transition-transform hover:scale-110 ${
                            newColumnColor === c.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                          }`}
                          style={{ backgroundColor: c.value }}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      type="submit"
                      disabled={!newColumnTitle.trim()}
                      className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      <Check size={14} />
                      <span>Add Column</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingColumn(false);
                        setNewColumnTitle('');
                      }}
                      className="px-2.5 py-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setIsAddingColumn(true)}
                  className="w-full h-12 flex items-center justify-center space-x-2 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 font-medium text-xs transition-colors"
                >
                  <Plus size={16} />
                  <span>Add Column</span>
                </button>
              )}
            </div>
          )}

          {typeof document !== 'undefined' && (
            <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
              {activeColumnId && activeColumn ? (
                <div className="w-[310px] opacity-90 shadow-2xl rounded-xl ring-2 ring-blue-500 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 cursor-grabbing">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeColumn.color || '#64748b' }} />
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">{activeColumn.title}</span>
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-gray-500 font-medium">
                      {tasks.filter(t => t.status === activeColumn.id).length}
                    </span>
                  </div>
                </div>
              ) : activeTaskId && activeTask ? (
                <div className="w-[300px] opacity-90 rotate-2 scale-105 cursor-grabbing">
                  <TaskCard task={activeTask} onClick={() => {}} isDragging />
                </div>
              ) : null}
            </DragOverlay>
          )}
        </DndContext>
      </div>

      {/* Task Detail Drawer */}
      <TaskDetailDrawer 
        taskId={selectedTaskId} 
        onClose={() => setSelectedTaskId(null)} 
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        projectId={projectId}
        initialStatus={initialStatus}
      />
    </>
  );
};

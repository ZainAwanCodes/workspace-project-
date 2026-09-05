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
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '@/types/task';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { moveTaskStatus, updateTask } from '@/lib/redux/slices/taskSlice';
import { selectFilteredTasks } from '@/lib/redux/selectors/taskSelectors';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskDetailDrawer } from '@/components/tasks/TaskDetailDrawer';

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'review', title: 'Review' },
  { id: 'done', title: 'Done' }
];

export const KanbanBoard = ({ projectId }: { projectId: string }) => {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(state => selectFilteredTasks(state, projectId));

  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const activeTask = useMemo(() => tasks.find((t) => t.id === activeId), [activeId, tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required before drag starts to allow for clicks
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const onDragOver = (event: DragOverEvent) => {
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
        // Different column, dispatch status update optimistically
        dispatch(moveTaskStatus({ id: activeTaskData.id, status: overTaskData.status }));
      }
    }

    // Dropping a task over an empty column
    if (isActiveTask && isOverColumn) {
      const activeTaskData = active.data.current?.task as Task;
      const targetColumn = over.data.current?.status as TaskStatus;
      
      if (activeTaskData.status !== targetColumn) {
        dispatch(moveTaskStatus({ id: activeTaskData.id, status: targetColumn }));
      }
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    // Real implementation would save exact sort order here
  };

  return (
    <>
      <div className="h-full w-full flex overflow-x-auto pb-4 gap-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          {COLUMNS.map((col) => (
            <KanbanColumn 
              key={col.id} 
              column={col} 
              tasks={tasks.filter(t => t.status === col.id)} 
              onTaskClick={(taskId) => setSelectedTaskId(taskId)}
            />
          ))}

          {typeof document !== 'undefined' && (
            <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
              {activeId && activeTask ? (
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
    </>
  );
};

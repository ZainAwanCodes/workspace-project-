import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { popUndo, popRedo, recordHistory, HistoryEntry } from '@/lib/redux/slices/historySlice';
import { restoreTasks } from '@/lib/redux/slices/taskSlice';
import { useToast } from '@/providers/ToastProvider';
import { Task } from '@/types/task';

export const useUndoRedo = () => {
  const dispatch = useAppDispatch();
  const { past, future } = useAppSelector(state => state.history);
  const { addToast } = useToast();

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const lastEntry = past[past.length - 1];
    
    // Previous tasks to restore
    const toRestore = lastEntry.previousTasks;
    
    // Identify IDs that were added in nextTasks but didn't exist in previousTasks (so we delete them on undo)
    const prevIds = new Set(toRestore.map(t => t.id));
    const toRemoveIds = lastEntry.nextTasks
      .map(t => t.id)
      .filter(id => !prevIds.has(id));

    dispatch(restoreTasks({
      toUpsert: toRestore,
      toRemoveIds: toRemoveIds.length > 0 ? toRemoveIds : undefined
    }));

    dispatch(popUndo());

    addToast({
      type: 'info',
      title: 'Action Undone',
      description: `Reverted "${lastEntry.description}"`,
      duration: 3000,
    });
  }, [past, dispatch, addToast]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const nextEntry = future[future.length - 1];

    // Next tasks to apply
    const toApply = nextEntry.nextTasks;

    // Identify IDs that existed in previousTasks but were removed in nextTasks
    const nextIds = new Set(toApply.map(t => t.id));
    const toRemoveIds = nextEntry.previousTasks
      .map(t => t.id)
      .filter(id => !nextIds.has(id));

    dispatch(restoreTasks({
      toUpsert: toApply,
      toRemoveIds: toRemoveIds.length > 0 ? toRemoveIds : undefined
    }));

    dispatch(popRedo());

    addToast({
      type: 'info',
      title: 'Action Redone',
      description: `Reapplied "${nextEntry.description}"`,
      duration: 3000,
    });
  }, [future, dispatch, addToast]);

  const trackAction = useCallback(({
    description,
    previousTasks,
    nextTasks,
    showToast = true,
  }: {
    description: string;
    previousTasks: Task[];
    nextTasks: Task[];
    showToast?: boolean;
  }) => {
    dispatch(recordHistory({
      description,
      previousTasks,
      nextTasks,
    }));

    if (showToast) {
      addToast({
        type: 'success',
        title: description,
        description: 'Changes saved',
        duration: 5000,
        action: {
          label: 'Undo',
          onClick: () => {
            // Restore previousTasks
            const prevIds = new Set(previousTasks.map(t => t.id));
            const toRemoveIds = nextTasks
              .map(t => t.id)
              .filter(id => !prevIds.has(id));

            dispatch(restoreTasks({
              toUpsert: previousTasks,
              toRemoveIds: toRemoveIds.length > 0 ? toRemoveIds : undefined
            }));
            dispatch(popUndo());
          },
        },
      });
    }
  }, [dispatch, addToast]);

  return {
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    undo,
    redo,
    trackAction,
    lastAction: past.length > 0 ? past[past.length - 1] : null,
  };
};

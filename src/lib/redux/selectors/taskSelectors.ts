import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Task } from '@/types/task';

// Input selectors
const selectTasks = (state: RootState) => state.tasks.entities;
const selectTaskIds = (state: RootState) => state.tasks.ids;
const selectActiveFilters = (state: RootState) => state.ui.activeFilters;
const selectGlobalSearchQuery = (state: RootState) => state.ui.globalSearchQuery;

export const selectTasksByProject = createSelector(
  [selectTasks, selectTaskIds, (_state: RootState, projectId: string) => projectId],
  (entities, ids, projectId) => {
    return ids
      .map(id => entities[id]!)
      .filter(task => task.projectId === projectId);
  }
);

export const selectFilteredTasks = createSelector(
  [selectTasksByProject, selectActiveFilters, selectGlobalSearchQuery],
  (projectTasks, filters, searchQuery) => {
    return projectTasks.filter(task => {
      // 1. Search Query Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // 2. Assignee Filter
      if (filters.assigneeIds.length > 0) {
        if (!task.assigneeId || !filters.assigneeIds.includes(task.assigneeId)) return false;
      }

      // 3. Status Filter
      if (filters.statuses.length > 0) {
        if (!filters.statuses.includes(task.status)) return false;
      }

      // 4. Priority Filter
      if (filters.priorities.length > 0) {
        if (!filters.priorities.includes(task.priority)) return false;
      }

      // 5. Labels Filter
      if (filters.labels.length > 0) {
        const hasMatch = task.labels.some(label => filters.labels.includes(label));
        if (!hasMatch) return false;
      }

      return true;
    });
  }
);

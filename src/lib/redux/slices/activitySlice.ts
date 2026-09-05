import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import { Activity } from '@/types/activity';

export const activitiesAdapter = createEntityAdapter<Activity>();

const initialActivities: Activity[] = [
  {
    id: 'a1',
    taskId: 't1',
    projectId: 'p1',
    actorId: 'u1',
    action: 'created',
    details: 'Task created',
    createdAt: new Date().toISOString()
  }
];

const activitySlice = createSlice({
  name: 'activities',
  initialState: activitiesAdapter.setAll(activitiesAdapter.getInitialState(), initialActivities),
  reducers: {
    logActivity: activitiesAdapter.addOne
  }
});

export const { logActivity } = activitySlice.actions;
export default activitySlice.reducer;

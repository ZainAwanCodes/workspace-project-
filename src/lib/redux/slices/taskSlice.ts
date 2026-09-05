import { createSlice, createEntityAdapter, PayloadAction, nanoid } from '@reduxjs/toolkit';
import { Task, Subtask, FileAttachment, Comment, TaskStatus } from '@/types/task';

export const tasksAdapter = createEntityAdapter<Task>();

const initialTasks: Task[] = [
  {
    id: 't1',
    projectId: 'p1',
    title: 'Design Homepage Mockups',
    description: 'Create high-fidelity mockups for the new homepage.',
    status: 'in-progress',
    priority: 'high',
    dueDate: new Date().toISOString(),
    assigneeId: 'u1',
    labels: ['design', 'homepage'],
    attachments: [],
    subtasks: [
      { id: 'st1', taskId: 't1', title: 'Header design', isCompleted: true },
      { id: 'st2', taskId: 't1', title: 'Hero section', isCompleted: false },
    ],
    comments: [
      { id: 'c1', taskId: 't1', authorId: 'u2', content: 'Looking forward to this!', createdAt: new Date().toISOString() }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const taskSlice = createSlice({
  name: 'tasks',
  initialState: tasksAdapter.setAll(tasksAdapter.getInitialState(), initialTasks),
  reducers: {
    addTask: (state, action: PayloadAction<Task>) => {
      tasksAdapter.addOne(state, action.payload);
    },
    addTasks: (state, action: PayloadAction<Task[]>) => {
      tasksAdapter.addMany(state, action.payload);
    },
    updateTask: tasksAdapter.updateOne,
    removeTask: tasksAdapter.removeOne,
    moveTaskStatus: (state, action: PayloadAction<{ id: string; status: TaskStatus }>) => {
      const task = state.entities[action.payload.id];
      if (task) {
        task.status = action.payload.status;
        task.updatedAt = new Date().toISOString();
      }
    },
    addSubtask: (state, action: PayloadAction<{ taskId: string; subtask: Subtask }>) => {
      const task = state.entities[action.payload.taskId];
      if (task) {
        task.subtasks.push(action.payload.subtask);
      }
    },
    updateSubtask: (state, action: PayloadAction<{ taskId: string; subtaskId: string; changes: Partial<Subtask> }>) => {
      const task = state.entities[action.payload.taskId];
      if (task) {
        const index = task.subtasks.findIndex(st => st.id === action.payload.subtaskId);
        if (index !== -1) {
          task.subtasks[index] = { ...task.subtasks[index], ...action.payload.changes };
        }
      }
    },
    removeSubtask: (state, action: PayloadAction<{ taskId: string; subtaskId: string }>) => {
      const task = state.entities[action.payload.taskId];
      if (task) {
        task.subtasks = task.subtasks.filter(st => st.id !== action.payload.subtaskId);
      }
    },
    convertSubtaskToTask: (state, action: PayloadAction<{ taskId: string; subtaskId: string; projectId: string }>) => {
      const task = state.entities[action.payload.taskId];
      if (task) {
        const subtaskIndex = task.subtasks.findIndex(st => st.id === action.payload.subtaskId);
        if (subtaskIndex !== -1) {
          const subtask = task.subtasks[subtaskIndex];
          task.subtasks.splice(subtaskIndex, 1);
          const newTask: Task = {
            id: nanoid(),
            projectId: action.payload.projectId,
            title: subtask.title,
            status: 'todo',
            priority: 'medium',
            labels: [],
            attachments: [],
            subtasks: [],
            comments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          tasksAdapter.addOne(state, newTask);
        }
      }
    },
    duplicateTask: (state, action: PayloadAction<string>) => {
      const task = state.entities[action.payload];
      if (task) {
        const duplicatedTask: Task = {
          ...task,
          id: nanoid(),
          title: `${task.title} (Copy)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        tasksAdapter.addOne(state, duplicatedTask);
      }
    },
    bulkUpdateTasks: (state, action: PayloadAction<{ ids: string[]; changes: Partial<Task> }>) => {
      const updates = action.payload.ids.map(id => ({ id, changes: action.payload.changes }));
      tasksAdapter.updateMany(state, updates);
    },
    bulkRemoveTasks: (state, action: PayloadAction<string[]>) => {
      tasksAdapter.removeMany(state, action.payload);
    },
    addAttachment: (state, action: PayloadAction<{ taskId: string; attachment: FileAttachment }>) => {
      const task = state.entities[action.payload.taskId];
      if (task) {
        task.attachments.push(action.payload.attachment);
      }
    },
    removeAttachment: (state, action: PayloadAction<{ taskId: string; attachmentId: string }>) => {
      const task = state.entities[action.payload.taskId];
      if (task) {
        task.attachments = task.attachments.filter(a => a.id !== action.payload.attachmentId);
      }
    },
    addComment: (state, action: PayloadAction<{ taskId: string; comment: Comment }>) => {
      const task = state.entities[action.payload.taskId];
      if (task) {
        task.comments.push(action.payload.comment);
      }
    },
    removeComment: (state, action: PayloadAction<{ taskId: string; commentId: string }>) => {
      const task = state.entities[action.payload.taskId];
      if (task) {
        task.comments = task.comments.filter(c => c.id !== action.payload.commentId);
      }
    }
  }
});

export const {
  addTask, addTasks, updateTask, removeTask, moveTaskStatus,
  addSubtask, updateSubtask, removeSubtask, convertSubtaskToTask,
  duplicateTask, bulkUpdateTasks, bulkRemoveTasks,
  addAttachment, removeAttachment, addComment, removeComment
} = taskSlice.actions;

export default taskSlice.reducer;

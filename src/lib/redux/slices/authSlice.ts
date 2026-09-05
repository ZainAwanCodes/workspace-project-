import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types/user';

interface AuthState {
  currentUser: User | null;
  users: User[]; // Mock users available to switch between
  isAuthenticated: boolean;
}

const mockUsers: User[] = [
  { id: 'u1', name: 'Alice Admin', email: 'alice@example.com', avatar: 'https://i.pravatar.cc/150?u=u1' },
  { id: 'u2', name: 'Bob Builder', email: 'bob@example.com', avatar: 'https://i.pravatar.cc/150?u=u2' },
  { id: 'u3', name: 'Charlie Checker', email: 'charlie@example.com', avatar: 'https://i.pravatar.cc/150?u=u3' },
  { id: 'u4', name: 'Diana Viewer', email: 'diana@example.com', avatar: 'https://i.pravatar.cc/150?u=u4' },
];

const initialState: AuthState = {
  currentUser: null,
  users: mockUsers,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<string>) => {
      const user = state.users.find(u => u.id === action.payload);
      if (user) {
        state.currentUser = user;
        state.isAuthenticated = true;
      }
    },
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
        const index = state.users.findIndex(u => u.id === state.currentUser!.id);
        if (index !== -1) {
          state.users[index] = state.currentUser;
        }
      }
    },
    switchUser: (state, action: PayloadAction<string>) => {
      const user = state.users.find(u => u.id === action.payload);
      if (user) {
        state.currentUser = user;
        state.isAuthenticated = true;
      }
    }
  }
});

export const { login, logout, updateProfile, switchUser } = authSlice.actions;
export default authSlice.reducer;

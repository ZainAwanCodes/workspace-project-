import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/lib/redux/hooks';
import { AppLayout } from '@/components/layout/AppLayout';
import Login from '@/pages/Login';
import WorkspaceDashboard from '@/pages/WorkspaceDashboard';
import ProjectDashboard from '@/pages/ProjectDashboard';

// Protected Route Wrapper
const ProtectedRoute = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};

// Workspace Redirector (redirects to the active workspace)
const WorkspaceRedirect = () => {
  const activeWorkspaceId = useAppSelector((state) => state.workspaces.activeWorkspaceId);
  
  if (activeWorkspaceId) {
    return <Navigate to={`/w/${activeWorkspaceId}`} replace />;
  }
  
  // Fallback if no workspaces exist
  return (
    <div className="flex-1 flex items-center justify-center p-8 text-gray-500">
      No workspaces found. Please create one.
    </div>
  );
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route element={<ProtectedRoute />}>
        {/* Root redirects to active workspace */}
        <Route path="/" element={<WorkspaceRedirect />} />
        
        {/* Workspace Routes */}
        <Route path="/w/:workspaceId" element={<WorkspaceDashboard />} />
        
        {/* Project Routes */}
        <Route path="/w/:workspaceId/p/:projectId" element={<ProjectDashboard />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

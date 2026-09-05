import React from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { login } from '@/lib/redux/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { Briefcase } from 'lucide-react';

export default function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const mockUsers = useAppSelector(state => state.auth.users);

  const handleLogin = (userId: string) => {
    dispatch(login(userId));
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-blue-200 dark:selection:bg-blue-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Briefcase className="text-white" size={32} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Workspace Manager
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Select a mock user to continue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-900 py-8 px-4 shadow-xl shadow-gray-200/50 dark:shadow-none sm:rounded-xl sm:px-10 border border-gray-100 dark:border-gray-800">
          <div className="space-y-4">
            {mockUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => handleLogin(user.id)}
                className="w-full flex items-center space-x-4 p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 bg-white dark:bg-gray-950 text-left group"
              >
                <Avatar name={user.name} src={user.avatar} size="lg" className="group-hover:ring-2 group-hover:ring-blue-500 group-hover:ring-offset-2 dark:group-hover:ring-offset-gray-950 transition-all" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

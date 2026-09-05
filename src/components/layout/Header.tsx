import React, { useState } from 'react';
import { Search, Bell, Menu, User as UserIcon, LogOut, Check } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { setSidebarOpen, setCommandPaletteOpen } from '@/lib/redux/slices/uiSlice';
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from '../ui/Dropdown';
import { switchUser } from '@/lib/redux/slices/authSlice';
import { markAllAsRead } from '@/lib/redux/slices/notificationSlice';
import { formatDistanceToNow } from 'date-fns';
import { UserProfileModal } from '../settings/UserProfileModal';

export const Header = () => {
  const dispatch = useAppDispatch();
  
  // State Selectors
  const currentUser = useAppSelector(state => state.auth.currentUser);
  const users = useAppSelector(state => state.auth.users);
  const { sidebarOpen } = useAppSelector(state => state.ui);
  
  const notifications = useAppSelector(state => Object.values(state.notifications.entities));
  const unreadCount = notifications.filter(n => n?.isRead === false).length;

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <header className="h-14 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex items-center justify-between px-4 flex-shrink-0 z-10">
      
      {/* Left side: Hamburger & Search */}
      <div className="flex items-center flex-1 max-w-2xl">
        {!sidebarOpen && (
          <button 
            onClick={() => dispatch(setSidebarOpen(true))}
            className="mr-3 p-1.5 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Open Sidebar"
          >
            <Menu size={20} />
          </button>
        )}
        
        {/* Global Search / Command Palette Trigger */}
        <div className="w-full relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-hover:text-blue-500 transition-colors">
            <Search size={16} />
          </div>
          <button
            onClick={() => dispatch(setCommandPaletteOpen(true))}
            className="w-full bg-gray-100 dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-transparent hover:border-gray-300 dark:hover:border-gray-700 rounded-md py-1.5 pl-10 pr-3 flex items-center justify-between text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          >
            <span>Search tasks, projects...</span>
            <div className="hidden sm:flex items-center space-x-1 opacity-70">
              <kbd className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5 text-xs font-sans font-medium text-gray-500 dark:text-gray-400">⌘</kbd>
              <kbd className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5 text-xs font-sans font-medium text-gray-500 dark:text-gray-400">K</kbd>
            </div>
          </button>
        </div>
      </div>

      {/* Right side: Notifications & Profile */}
      <div className="flex items-center space-x-4 ml-4">
        
        {/* Notifications */}
        <Dropdown>
          <DropdownTrigger>
            <button 
              className="relative p-2 rounded-full text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white dark:border-gray-950"></span>
              )}
            </button>
          </DropdownTrigger>
          <DropdownContent align="right" className="w-80">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    dispatch(markAllAsRead());
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">No new notifications</div>
              ) : (
                notifications.slice(0, 10).map((notif) => (
                  <DropdownItem key={notif!.id} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0 p-3">
                    <div className="flex flex-col">
                      <span className={`text-sm ${notif!.isRead ? 'text-gray-500' : 'text-gray-900 dark:text-gray-100 font-medium'}`}>
                        {notif!.message}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notif!.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </DropdownItem>
                ))
              )}
            </div>
          </DropdownContent>
        </Dropdown>

        {/* Profile Switcher */}
        <Dropdown>
          <DropdownTrigger>
            <button 
              className="flex items-center space-x-2 focus:outline-none rounded-full ring-2 ring-transparent hover:ring-blue-100 dark:hover:ring-blue-900 transition-all"
              aria-label="User Profile"
            >
              {currentUser?.avatar ? (
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 object-cover" 
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                  <UserIcon size={16} />
                </div>
              )}
            </button>
          </DropdownTrigger>
          <DropdownContent align="right" className="w-64">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{currentUser?.name}</p>
              <p className="text-xs text-gray-500 truncate">{currentUser?.email}</p>
            </div>
            <div className="py-1">
              <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Switch Account</div>
              {users.map(u => (
                <DropdownItem 
                  key={u.id} 
                  onClick={() => dispatch(switchUser(u.id))}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full" />
                    <span>{u.name}</span>
                  </div>
                  {currentUser?.id === u.id && <Check size={14} className="text-blue-500" />}
                </DropdownItem>
              ))}
            </div>
            <div className="border-t border-gray-100 dark:border-gray-800 py-1">
              <DropdownItem className="flex items-center" onClick={() => setIsProfileModalOpen(true)}>
                <UserIcon size={14} className="mr-2" /> Profile Settings
              </DropdownItem>
              <DropdownItem destructive className="flex items-center">
                <LogOut size={14} className="mr-2" /> Sign Out
              </DropdownItem>
            </div>
          </DropdownContent>
        </Dropdown>
        
      </div>
      
      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </header>
  );
};

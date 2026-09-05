import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Bell,
  Menu,
  User as UserIcon,
  LogOut,
  Check,
  Settings,
  RotateCcw,
  RotateCw,
  Keyboard,
  Sun,
  Moon,
  ArrowLeft,
  Home,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { setSidebarOpen, setCommandPaletteOpen, setShortcutsModalOpen, toggleTheme } from '@/lib/redux/slices/uiSlice';
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from '../ui/Dropdown';
import { switchUser, logout } from '@/lib/redux/slices/authSlice';
import { markAllAsRead } from '@/lib/redux/slices/notificationSlice';
import { formatDistanceToNow } from 'date-fns';
import { UserProfileModal } from '../settings/UserProfileModal';
import { AppSettingsModal } from '../settings/AppSettingsModal';
import { OfflineIndicator } from './OfflineIndicator';
import { ActivityTicker } from '../activity/ActivityTicker';
import { useUndoRedo } from '@/hooks/useUndoRedo';

export const Header = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { undo, redo, canUndo, canRedo } = useUndoRedo();

  const currentUser = useAppSelector(state => state.auth.currentUser);
  const users = useAppSelector(state => state.auth.users);
  const { sidebarOpen, theme } = useAppSelector(state => state.ui);

  const notifications = useAppSelector(state => Object.values(state.notifications.entities));
  const unreadCount = notifications.filter(n => n?.isRead === false).length;

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAppSettingsOpen, setIsAppSettingsOpen] = useState(false);

  const handleGoBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      // Smart fallback based on route structure
      if (location.pathname.includes('/p/')) {
        const match = location.pathname.match(/\/w\/([^/]+)/);
        if (match) {
          navigate(`/w/${match[1]}`);
          return;
        }
      }
      navigate('/');
    }
  };

  const handleSignOut = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <header
      className="h-14 flex items-center justify-between px-3 sm:px-4 flex-shrink-0 z-10 gap-2 sm:gap-3"
      style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
    >
      {/* Left: Hamburger, Back Button & Search */}
      <div className="flex items-center flex-1 max-w-xl min-w-0">
        <button
          onClick={() => dispatch(setSidebarOpen(!sidebarOpen))}
          className={`mr-1.5 sm:mr-2 p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus-accent ${
            sidebarOpen ? 'md:hidden' : 'block'
          }`}
          style={{ color: 'var(--text-secondary)' }}
          aria-label="Toggle Sidebar"
          title="Toggle Sidebar"
        >
          <Menu size={19} />
        </button>

        {/* Global Back button */}
        <motion.button
          onClick={handleGoBack}
          className="mr-2 sm:mr-3 px-2 py-1.5 rounded-lg transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus-accent flex-shrink-0 group"
          style={{
            background: 'var(--surface-raised)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
          }}
          whileHover={{ scale: 1.02, color: 'var(--text-primary)' }}
          whileTap={{ scale: 0.96 }}
          title="Go back to previous page"
          aria-label="Go back to previous page"
        >
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden xs:inline text-xs font-medium">Back</span>
        </motion.button>

        {/* Global Search trigger */}
        <div className="w-full relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" style={{ color: 'var(--text-muted)' }}>
            <Search size={16} />
          </div>
          <button
            onClick={() => dispatch(setCommandPaletteOpen(true))}
            className="w-full rounded-md py-1.5 pl-10 pr-3 flex items-center justify-between text-sm transition-all focus:outline-none focus:ring-2 focus-accent shadow-sm"
            style={{
              background: 'var(--surface-raised)',
              color: 'var(--text-muted)',
              border: '1px solid transparent',
            }}
          >
            <span className="truncate">
              <span className="hidden sm:inline">Search tasks, projects...</span>
              <span className="sm:hidden text-xs">Search...</span>
            </span>
            <div className="hidden sm:flex items-center space-x-1 opacity-70">
              <kbd
                className="rounded px-1.5 py-0.5 text-xs font-sans font-medium"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              >⌘</kbd>
              <kbd
                className="rounded px-1.5 py-0.5 text-xs font-sans font-medium"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              >K</kbd>
            </div>
          </button>
        </div>
      </div>

      {/* Center: Activity Ticker */}
      <div className="hidden md:flex items-center">
        <ActivityTicker />
      </div>

      {/* Right: controls */}
      <div className="flex items-center space-x-1.5 sm:space-x-2">

        {/* Undo / Redo */}
        <div
          className="hidden lg:flex items-center space-x-0.5 rounded-lg p-0.5"
          style={{ background: 'var(--surface-raised)', border: '1px solid var(--border)' }}
        >
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-1.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: 'var(--text-secondary)' }}
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-1.5 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: 'var(--text-secondary)' }}
            title="Redo (Ctrl+Shift+Z)"
          >
            <RotateCw size={14} />
          </button>
        </div>

        {/* Keyboard Shortcuts */}
        <button
          onClick={() => dispatch(setShortcutsModalOpen(true))}
          className="p-2 rounded-lg transition-colors focus:outline-none focus-accent hidden sm:flex"
          style={{ color: 'var(--text-secondary)' }}
          title="Keyboard Shortcuts (?)"
          aria-label="Keyboard Shortcuts"
        >
          <Keyboard size={18} />
        </button>

        {/* Dark Mode Toggle */}
        <motion.button
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-lg transition-colors focus:outline-none focus-accent"
          style={{ color: 'var(--text-secondary)' }}
          whileHover={{ scale: 1.08, background: 'var(--surface-raised)' }}
          whileTap={{ scale: 0.92 }}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle theme"
        >
          <AnimatePresence mode="wait" initial={false}>
            {theme === 'dark' ? (
              <motion.span
                key="sun"
                initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <Sun size={17} />
              </motion.span>
            ) : (
              <motion.span
                key="moon"
                initial={{ rotate: 90, opacity: 0, scale: 0.7 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -90, opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <Moon size={17} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <OfflineIndicator />

        {/* Notifications */}
        <Dropdown>
          <DropdownTrigger>
            <button
              className="relative p-2 rounded-full transition-colors focus:outline-none focus-accent"
              style={{ color: 'var(--text-secondary)' }}
              aria-label="Notifications"
            >
              <Bell size={19} />
              {unreadCount > 0 && (
                <span
                  className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full border-2"
                  style={{ background: 'var(--error)', borderColor: 'var(--surface)' }}
                />
              )}
            </button>
          </DropdownTrigger>
          <DropdownContent align="right" className="w-[calc(100vw-2rem)] sm:w-80 max-w-sm">
            <div className="px-4 py-3 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="font-semibold text-xs" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); dispatch(markAllAsRead()); }}
                  className="text-xs transition-colors"
                  style={{ color: 'var(--accent)' }}
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-xs" style={{ color: 'var(--text-muted)' }}>No new notifications</div>
              ) : (
                notifications.slice(0, 10).map((notif) => (
                  <DropdownItem key={notif!.id} className="p-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <div className="flex flex-col">
                      <span className={`text-xs ${notif!.isRead ? '' : 'font-medium'}`} style={{ color: notif!.isRead ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                        {notif!.message}
                      </span>
                      <span className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
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
              className="flex items-center space-x-2 focus:outline-none rounded-full ring-2 ring-transparent transition-all"
              style={{ '--tw-ring-color': 'var(--accent-muted)' } as React.CSSProperties}
              aria-label="User Profile"
            >
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover"
                  style={{ border: '1px solid var(--border)' }}
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--accent-muted)', color: 'var(--accent-muted-fg)', border: '1px solid var(--accent-muted)' }}
                >
                  <UserIcon size={16} />
                </div>
              )}
            </button>
          </DropdownTrigger>
          <DropdownContent align="right" className="w-[calc(100vw-2rem)] sm:w-64 max-w-xs">
            <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{currentUser?.name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{currentUser?.email}</p>
            </div>
            <div className="py-1">
              <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Switch Account</div>
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
                  {currentUser?.id === u.id && <Check size={14} style={{ color: 'var(--accent)' }} />}
                </DropdownItem>
              ))}
            </div>
            <div className="py-1" style={{ borderTop: '1px solid var(--border)' }}>
              <DropdownItem className="flex items-center" onClick={() => navigate('/')}>
                <Home size={14} className="mr-2" /> Back to Website
              </DropdownItem>
              <DropdownItem className="flex items-center" onClick={() => setIsProfileModalOpen(true)}>
                <UserIcon size={14} className="mr-2" /> Profile Settings
              </DropdownItem>
              <DropdownItem className="flex items-center" onClick={() => setIsAppSettingsOpen(true)}>
                <Settings size={14} className="mr-2" /> App Settings
              </DropdownItem>
              <DropdownItem destructive className="flex items-center" onClick={handleSignOut}>
                <LogOut size={14} className="mr-2" /> Sign Out
              </DropdownItem>
            </div>
          </DropdownContent>
        </Dropdown>
      </div>

      <UserProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
      <AppSettingsModal isOpen={isAppSettingsOpen} onClose={() => setIsAppSettingsOpen(false)} />
    </header>
  );
};

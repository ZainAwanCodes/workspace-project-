import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from './CommandPalette';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { 
  setCommandPaletteOpen, 
  setShortcutsModalOpen, 
  setActiveViewMode,
  setSidebarOpen
} from '@/lib/redux/slices/uiSlice';
import { useUndoRedo } from '@/hooks/useUndoRedo';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const theme = useAppSelector(state => state.ui.theme);
  const dispatch = useAppDispatch();
  const { undo, redo } = useUndoRedo();

  useKeyboardShortcuts([
    {
      combo: { key: 'k', metaKey: true },
      callback: () => dispatch(setCommandPaletteOpen(true)),
    },
    {
      combo: { key: 'k', ctrlKey: true },
      callback: () => dispatch(setCommandPaletteOpen(true)),
    },
    {
      combo: { key: 'z', metaKey: true, shiftKey: false },
      callback: () => undo(),
    },
    {
      combo: { key: 'z', ctrlKey: true, shiftKey: false },
      callback: () => undo(),
    },
    {
      combo: { key: 'z', metaKey: true, shiftKey: true },
      callback: () => redo(),
    },
    {
      combo: { key: 'z', ctrlKey: true, shiftKey: true },
      callback: () => redo(),
    },
    {
      combo: { key: 'y', ctrlKey: true },
      callback: () => redo(),
    },
    {
      combo: { key: '?' },
      callback: () => dispatch(setShortcutsModalOpen(true)),
    },
    {
      combo: { key: '1' },
      callback: () => dispatch(setActiveViewMode('kanban')),
    },
    {
      combo: { key: '2' },
      callback: () => dispatch(setActiveViewMode('list')),
    },
    {
      combo: { key: '3' },
      callback: () => dispatch(setActiveViewMode('calendar')),
    },
  ]);

  // Sync Redux theme → DOM class + localStorage (single source of truth)
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('wm-theme', theme);
  }, [theme]);

  // Collapse sidebar initially on mobile screens (< 768px)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      dispatch(setSidebarOpen(false));
    }
  }, [dispatch]);

  return (
    <div className="flex h-screen overflow-hidden font-sans transition-colors duration-200" style={{ background: 'var(--bg)', color: 'var(--text-primary)', ['--tw-selection-bg' as string]: 'var(--accent-muted)' }}>
      
      {/* Sidebar Component */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header />
        
        {/* Main Workspace Viewport */}
        <main className="flex-1 overflow-auto relative focus:outline-none" style={{ background: 'var(--bg)' }}>
          {children}
        </main>
      </div>
      
      <CommandPalette />
      <KeyboardShortcutsModal />
    </div>
  );
};

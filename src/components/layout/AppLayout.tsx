import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { CommandPalette } from './CommandPalette';
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { setCommandPaletteOpen } from '@/lib/redux/slices/uiSlice';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const theme = useAppSelector(state => state.ui.theme);
  const dispatch = useAppDispatch();

  useKeyboardShortcuts([
    {
      combo: { key: 'k', metaKey: true },
      callback: () => dispatch(setCommandPaletteOpen(true)),
    },
    {
      combo: { key: 'k', ctrlKey: true },
      callback: () => dispatch(setCommandPaletteOpen(true)),
    }
  ]);

  // Sync Redux theme state with document.documentElement class for Tailwind Dark Mode
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [theme]);

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans selection:bg-blue-200 dark:selection:bg-blue-900 transition-colors duration-200">
      
      {/* Sidebar Component */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Header />
        
        {/* Main Workspace Viewport */}
        <main className="flex-1 overflow-auto relative focus:outline-none bg-white dark:bg-gray-950">
          {children}
        </main>
      </div>
      
      <CommandPalette />
    </div>
  );
};

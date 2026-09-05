import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowLeft } from 'lucide-react';
import { cn } from '@/utils/cn';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  side?: 'left' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  side = 'right',
  size = 'md',
  className,
}: DrawerProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  const drawerContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-gray-900/50 dark:bg-gray-900/80 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: side === 'right' ? '100%' : '-100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: side === 'right' ? '100%' : '-100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed top-0 bottom-0 z-50 flex flex-col bg-white dark:bg-gray-950 shadow-2xl w-full border-gray-200 dark:border-gray-800 max-w-full sm:max-w-md lg:max-w-xl',
              side === 'right' ? 'right-0 border-l' : 'left-0 border-r',
              sizes[size],
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-gray-900 flex-shrink-0">
              <div className="flex items-center space-x-2 min-w-0 pr-2">
                <button
                  onClick={onClose}
                  className="p-1.5 -ml-1 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Go back / Close"
                  aria-label="Go back"
                >
                  <ArrowLeft size={16} />
                  <span className="hidden xs:inline">Back</span>
                </button>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close drawer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(drawerContent, document.body) : null;
};

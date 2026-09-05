import React, { useEffect, useRef } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { cn } from '@/utils/cn';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Modal = ({ isOpen, onClose, title, children, className, size = 'md' }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-[95vw] h-[95vh]',
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900/50 dark:bg-gray-900/80 backdrop-blur-sm p-3 sm:p-4">
      <div
        ref={modalRef}
        className={cn(
          'relative w-full rounded-xl bg-white dark:bg-gray-900 shadow-2xl flex flex-col max-h-[calc(100dvh-2rem)] sm:max-h-[90vh]',
          sizes[size],
          size === 'full' && 'm-2 sm:m-4',
          className
        )}
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
      >
        {/* Header */}
        {(title || onClose) && (
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0">
            <div className="flex items-center space-x-2 min-w-0 pr-2">
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 -ml-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors flex items-center gap-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Go back / Close"
                aria-label="Go back"
              >
                <ArrowLeft size={16} />
                <span className="hidden xs:inline">Back</span>
              </button>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className={cn("p-4 sm:p-6 overflow-y-auto", size === 'full' && 'flex-1')}>
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

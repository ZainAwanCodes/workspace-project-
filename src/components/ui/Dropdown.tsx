import React, { createContext, useContext, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { cn } from '@/utils/cn';

interface DropdownContextType {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

const DropdownContext = createContext<DropdownContextType | undefined>(undefined);

export const Dropdown = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);

  useOnClickOutside(dropdownRef, close);

  return (
    <DropdownContext.Provider value={{ isOpen, toggle, close }}>
      <div ref={dropdownRef} className={cn('relative inline-block text-left', className)}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
};

export const DropdownTrigger = ({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const context = useContext(DropdownContext);
  if (!context) throw new Error('DropdownTrigger must be used within a Dropdown');

  return (
    <div onClick={context.toggle} className={cn('cursor-pointer', className)} style={style}>
      {children}
    </div>
  );
};

export const DropdownContent = ({
  children,
  className,
  align = 'right',
}: {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right';
}) => {
  const context = useContext(DropdownContext);
  if (!context) throw new Error('DropdownContent must be used within a Dropdown');

  return (
    <AnimatePresence>
      {context.isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -5, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -5, scale: 0.95 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className={cn(
            'absolute z-50 mt-2 w-56 rounded-xl shadow-xl focus:outline-none overflow-hidden',
            align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
            className
          )}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }}
        >
          <div className="py-1" role="menu" aria-orientation="vertical">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const DropdownItem = ({
  children,
  onClick,
  className,
  style,
  destructive,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  destructive?: boolean;
}) => {
  const context = useContext(DropdownContext);

  const handleClick = () => {
    if (onClick) onClick();
    context?.close();
  };

  return (
    <button
      onClick={handleClick}
      className={cn('w-full text-left block px-4 py-2 text-sm transition-colors', className)}
      style={{
        color: destructive ? 'var(--error)' : 'var(--text-secondary)',
        ...style,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = destructive
          ? 'var(--error-muted)'
          : 'var(--surface-raised)';
        if (!style?.color) {
          (e.currentTarget as HTMLButtonElement).style.color = destructive
            ? 'var(--error)'
            : 'var(--text-primary)';
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = '';
        if (!style?.color) {
          (e.currentTarget as HTMLButtonElement).style.color = destructive ? 'var(--error)' : 'var(--text-secondary)';
        }
      }}
      role="menuitem"
    >
      {children}
    </button>
  );
};

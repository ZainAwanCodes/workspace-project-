import React from 'react';
import { cn } from '@/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {

    const variants = {
      primary: '',
      secondary: 'bg-[var(--surface-raised)] text-[var(--text-primary)] hover:bg-[var(--border)]',
      outline: 'border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--surface-raised)]',
      ghost: 'text-[var(--text-secondary)] hover:bg-[var(--surface-raised)] hover:text-[var(--text-primary)]',
      destructive: 'text-white shadow-sm',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-9 px-4 text-sm',
      lg: 'h-11 px-8 text-base',
      icon: 'h-9 w-9 flex items-center justify-center p-0',
    };

    const primaryStyle = variant === 'primary'
      ? { background: 'var(--accent)', color: '#fff' }
      : variant === 'destructive'
      ? { background: 'var(--error)', color: '#fff' }
      : undefined;

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        style={primaryStyle}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent)] dark:focus:ring-offset-[var(--bg)] disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

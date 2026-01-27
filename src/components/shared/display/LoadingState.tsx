'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LoadingStateProps {
  /** Loading message */
  message?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Container className */
  className?: string;
  /** Show as inline (no padding) */
  inline?: boolean;
  /** Show as overlay */
  overlay?: boolean;
  /** Spinner color */
  color?: 'default' | 'primary' | 'white';
}

const sizeClasses = {
  sm: {
    container: 'py-6',
    spinner: 'h-6 w-6',
    text: 'text-xs',
  },
  md: {
    container: 'py-10',
    spinner: 'h-8 w-8',
    text: 'text-sm',
  },
  lg: {
    container: 'py-14',
    spinner: 'h-10 w-10',
    text: 'text-base',
  },
};

const colorClasses = {
  default: 'text-gray-400',
  primary: 'text-pink-600',
  white: 'text-white',
};

/**
 * Reusable loading state component.
 * 
 * @example
 * ```tsx
 * // Simple loading
 * <LoadingState message="Loading users..." />
 * 
 * // Overlay loading
 * <LoadingState overlay message="Saving changes..." />
 * 
 * // Inline loading
 * <LoadingState inline size="sm" />
 * ```
 */
export function LoadingState({
  message,
  size = 'md',
  className,
  inline = false,
  overlay = false,
  color = 'primary',
}: LoadingStateProps) {
  const sizes = sizeClasses[size];

  if (overlay) {
    return (
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50',
          className
        )}
      >
        <div className="flex flex-col items-center">
          <Loader2 className={cn('animate-spin', sizes.spinner, colorClasses[color])} />
          {message && (
            <p className={cn('text-gray-600 mt-2', sizes.text)}>{message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        !inline && sizes.container,
        inline && 'flex-row gap-2',
        className
      )}
    >
      <Loader2 className={cn('animate-spin', sizes.spinner, colorClasses[color])} />
      {message && (
        <p className={cn('text-gray-500', sizes.text, !inline && 'mt-2')}>
          {message}
        </p>
      )}
    </div>
  );
}

export default LoadingState;

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LucideIcon } from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Field label */
  label: string;
  /** Optional icon to display on the left */
  icon?: LucideIcon;
  /** Error message to display */
  error?: string;
  /** Helper text below the input */
  helperText?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Container className */
  containerClassName?: string;
}

/**
 * Reusable text input field with label, icon support, and error display.
 * Use this for all text inputs across the application for consistent styling.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      icon: Icon,
      error,
      helperText,
      required,
      className,
      containerClassName,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={cn('space-y-2', containerClassName)}>
        <Label htmlFor={inputId} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          )}
          <Input
            ref={ref}
            id={inputId}
            className={cn(
              Icon && 'pl-10',
              error && 'border-red-500 focus-visible:ring-red-500',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextField.displayName = 'TextField';

export default TextField;

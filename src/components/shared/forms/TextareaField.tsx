'use client';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Field label */
  label: string;
  /** Error message to display */
  error?: string;
  /** Helper text below the input */
  helperText?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Container className */
  containerClassName?: string;
  /** Maximum character count to show counter */
  maxLength?: number;
  /** Show character count */
  showCount?: boolean;
}

/**
 * Reusable textarea field with label, error display, and optional character count.
 */
export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  (
    {
      label,
      error,
      helperText,
      required,
      className,
      containerClassName,
      id,
      maxLength,
      showCount,
      value,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name || label.toLowerCase().replace(/\s+/g, '-');
    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className={cn('space-y-2', containerClassName)}>
        <div className="flex items-center justify-between">
          <Label htmlFor={inputId} className="text-sm font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {showCount && maxLength && (
            <span className={cn(
              'text-xs',
              currentLength > maxLength ? 'text-red-500' : 'text-gray-500'
            )}>
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
        <Textarea
          ref={ref}
          id={inputId}
          value={value}
          maxLength={maxLength}
          className={cn(
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
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

TextareaField.displayName = 'TextareaField';

export default TextareaField;

'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock } from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface DateTimeFieldProps {
  /** Field label */
  label: string;
  /** Date value (YYYY-MM-DD format) */
  dateValue?: string;
  /** Time value (HH:MM format) */
  timeValue?: string;
  /** Date change handler */
  onDateChange?: (value: string) => void;
  /** Time change handler */
  onTimeChange?: (value: string) => void;
  /** Error message to display */
  error?: string;
  /** Helper text below the input */
  helperText?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether to show only date */
  dateOnly?: boolean;
  /** Whether to show only time */
  timeOnly?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Container className */
  containerClassName?: string;
  /** Field name prefix */
  name?: string;
  /** Field id prefix */
  id?: string;
  /** Minimum date */
  minDate?: string;
  /** Maximum date */
  maxDate?: string;
}

/**
 * Reusable date/time picker field with label and error display.
 * Supports date-only, time-only, or combined date-time input.
 */
export const DateTimeField = forwardRef<HTMLInputElement, DateTimeFieldProps>(
  (
    {
      label,
      dateValue,
      timeValue,
      onDateChange,
      onTimeChange,
      error,
      helperText,
      required,
      dateOnly = false,
      timeOnly = false,
      disabled,
      containerClassName,
      name,
      id,
      minDate,
      maxDate,
    },
    ref
  ) => {
    const fieldId = id || name || label.toLowerCase().replace(/\s+/g, '-');
    const showDate = !timeOnly;
    const showTime = !dateOnly;

    return (
      <div className={cn('space-y-2', containerClassName)}>
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <div className={cn('grid gap-3', showDate && showTime ? 'grid-cols-2' : 'grid-cols-1')}>
          {showDate && (
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                ref={showDate && !showTime ? ref : undefined}
                id={`${fieldId}-date`}
                name={name ? `${name}-date` : undefined}
                type="date"
                value={dateValue || ''}
                onChange={(e) => onDateChange?.(e.target.value)}
                disabled={disabled}
                min={minDate}
                max={maxDate}
                className={cn(
                  'pl-10',
                  error && 'border-red-500 focus-visible:ring-red-500'
                )}
                aria-invalid={!!error}
              />
            </div>
          )}
          {showTime && (
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                ref={showTime && !showDate ? ref : undefined}
                id={`${fieldId}-time`}
                name={name ? `${name}-time` : undefined}
                type="time"
                value={timeValue || ''}
                onChange={(e) => onTimeChange?.(e.target.value)}
                disabled={disabled}
                className={cn(
                  'pl-10',
                  error && 'border-red-500 focus-visible:ring-red-500'
                )}
                aria-invalid={!!error}
              />
            </div>
          )}
        </div>
        {error && (
          <p id={`${fieldId}-error`} className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${fieldId}-helper`} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

DateTimeField.displayName = 'DateTimeField';

export default DateTimeField;

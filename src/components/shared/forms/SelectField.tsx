'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectFieldProps {
  /** Field label */
  label: string;
  /** Options for the select */
  options: SelectOption[];
  /** Current value */
  value?: string;
  /** Change handler */
  onValueChange?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Optional icon to display on the left */
  icon?: LucideIcon;
  /** Error message to display */
  error?: string;
  /** Helper text below the input */
  helperText?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Container className */
  containerClassName?: string;
  /** Trigger className */
  className?: string;
  /** Field name for form */
  name?: string;
  /** Field id */
  id?: string;
}

/**
 * Reusable select/dropdown field with label and error display.
 * Use this for all dropdowns across the application for consistent styling.
 */
export function SelectField({
  label,
  options,
  value,
  onValueChange,
  placeholder = 'Select an option',
  icon: Icon,
  error,
  helperText,
  required,
  disabled,
  containerClassName,
  className,
  name,
  id,
}: SelectFieldProps) {
  const fieldId = id || name || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn('space-y-2', containerClassName)}>
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
        )}
        <Select value={value} onValueChange={onValueChange} disabled={disabled} name={name}>
          <SelectTrigger
            id={fieldId}
            className={cn(
              Icon && 'pl-10',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${fieldId}-error` : helperText ? `${fieldId}-helper` : undefined}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

export default SelectField;

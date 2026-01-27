'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface CheckboxFieldProps {
  /** Field label */
  label: string;
  /** Description text shown below the label */
  description?: string;
  /** Whether the checkbox is checked */
  checked?: boolean;
  /** Change handler */
  onCheckedChange?: (checked: boolean) => void;
  /** Error message to display */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Container className */
  containerClassName?: string;
  /** Field name for form */
  name?: string;
  /** Field id */
  id?: string;
}

/**
 * Reusable checkbox field with label and optional description.
 */
export function CheckboxField({
  label,
  description,
  checked,
  onCheckedChange,
  error,
  required,
  disabled,
  containerClassName,
  name,
  id,
}: CheckboxFieldProps) {
  const fieldId = id || name || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn('space-y-2', containerClassName)}>
      <div className="flex items-start space-x-3">
        <Checkbox
          id={fieldId}
          name={name}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : description ? `${fieldId}-description` : undefined}
          className={cn(error && 'border-red-500')}
        />
        <div className="space-y-1 leading-none">
          <Label
            htmlFor={fieldId}
            className={cn(
              'text-sm font-medium cursor-pointer',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {description && (
            <p
              id={`${fieldId}-description`}
              className="text-sm text-gray-500"
            >
              {description}
            </p>
          )}
        </div>
      </div>
      {error && (
        <p id={`${fieldId}-error`} className="text-sm text-red-500 ml-7" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default CheckboxField;

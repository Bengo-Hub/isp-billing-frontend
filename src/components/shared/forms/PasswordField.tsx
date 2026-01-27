'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';
import { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface PasswordFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
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
  /** Whether to show password strength indicator */
  showStrength?: boolean;
}

/**
 * Reusable password input field with visibility toggle.
 * Includes optional password strength indicator.
 */
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
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
      showStrength,
      value,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || props.name || label.toLowerCase().replace(/\s+/g, '-');

    const getPasswordStrength = (password: string): { label: string; color: string; width: string } => {
      if (!password) return { label: '', color: '', width: '0%' };
      if (password.length < 6) return { label: 'Weak', color: 'bg-red-500', width: '25%' };
      if (password.length < 8) return { label: 'Fair', color: 'bg-yellow-500', width: '50%' };
      if (password.length < 12 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
        return { label: 'Good', color: 'bg-blue-500', width: '75%' };
      }
      if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
        return { label: 'Strong', color: 'bg-green-500', width: '100%' };
      }
      return { label: 'Fair', color: 'bg-yellow-500', width: '50%' };
    };

    const strength = showStrength && typeof value === 'string' ? getPasswordStrength(value) : null;

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
            type={showPassword ? 'text' : 'password'}
            value={value}
            className={cn(
              'pr-10',
              Icon && 'pl-10',
              error && 'border-red-500 focus-visible:ring-red-500',
              className
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {showStrength && strength && strength.label && (
          <div className="space-y-1">
            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn('h-full transition-all duration-300', strength.color)}
                style={{ width: strength.width }}
              />
            </div>
            <p className="text-xs text-gray-500">Password strength: {strength.label}</p>
          </div>
        )}
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

PasswordField.displayName = 'PasswordField';

export default PasswordField;

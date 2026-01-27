'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone } from 'lucide-react';
import { forwardRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface PhoneFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
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
  /** Country code prefix (default: +254 for Kenya) */
  countryCode?: string;
  /** Change handler that receives formatted value */
  onChange?: (value: string) => void;
}

/**
 * Reusable phone number input field with formatting and validation.
 * Automatically formats Kenyan phone numbers (0712... or +254712...).
 */
export const PhoneField = forwardRef<HTMLInputElement, PhoneFieldProps>(
  (
    {
      label,
      error,
      helperText,
      required,
      className,
      containerClassName,
      id,
      countryCode = '+254',
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name || label.toLowerCase().replace(/\s+/g, '-');

    const formatPhoneNumber = useCallback((input: string): string => {
      // Remove all non-digit characters except +
      let cleaned = input.replace(/[^\d+]/g, '');
      
      // Handle Kenyan format
      if (cleaned.startsWith('0')) {
        // Convert 0712... to +254712...
        cleaned = countryCode + cleaned.slice(1);
      } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
        // Convert 712... to +254712...
        cleaned = countryCode + cleaned;
      } else if (!cleaned.startsWith('+') && cleaned.length > 0) {
        // Add country code if not present
        cleaned = countryCode + cleaned;
      }
      
      return cleaned;
    }, [countryCode]);

    const displayValue = typeof value === 'string' ? value : '';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhoneNumber(e.target.value);
      onChange?.(formatted);
    };

    const validatePhone = (phone: string): boolean => {
      // Basic validation for Kenyan numbers
      const kenyanRegex = /^\+254[17]\d{8}$/;
      return kenyanRegex.test(phone);
    };

    const isValid = displayValue ? validatePhone(displayValue) : true;

    return (
      <div className={cn('space-y-2', containerClassName)}>
        <Label htmlFor={inputId} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            ref={ref}
            id={inputId}
            type="tel"
            value={displayValue}
            onChange={handleChange}
            placeholder="07XX XXX XXX"
            className={cn(
              'pl-10',
              (error || (!isValid && displayValue)) && 'border-red-500 focus-visible:ring-red-500',
              className
            )}
            aria-invalid={!!error || !isValid}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        {!error && !isValid && displayValue && (
          <p className="text-sm text-amber-600" role="alert">
            Please enter a valid phone number (e.g., 0712345678)
          </p>
        )}
        {helperText && !error && (isValid || !displayValue) && (
          <p id={`${inputId}-helper`} className="text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

PhoneField.displayName = 'PhoneField';

export default PhoneField;

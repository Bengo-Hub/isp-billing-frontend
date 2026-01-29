'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, defaultChecked, checked, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(defaultChecked || checked || false);

    React.useEffect(() => {
      if (checked !== undefined) {
        setIsChecked(checked);
      }
    }, [checked]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newChecked = e.target.checked;
      setIsChecked(newChecked);
      onCheckedChange?.(newChecked);
      props.onChange?.(e);
    };

    return (
      <label className={cn('relative inline-flex items-center cursor-pointer', className)}>
        <input
          type="checkbox"
          className="sr-only peer"
          ref={ref}
          checked={isChecked}
          onChange={handleChange}
          {...props}
        />
        <div className={cn(
          'w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300',
          'rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full',
          'peer-checked:after:border-white after:content-[\'\'] after:absolute after:top-[2px] after:start-[2px]',
          'after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5',
          'after:transition-all peer-checked:bg-blue-600'
        )} />
      </label>
    );
  }
);

Switch.displayName = 'Switch';

export { Switch };

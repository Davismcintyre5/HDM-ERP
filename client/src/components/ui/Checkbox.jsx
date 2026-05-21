import { forwardRef } from 'react';
import clsx from 'clsx';

const Checkbox = forwardRef(({ className, label, ...props }, ref) => (
  <label className="inline-flex items-center gap-2 cursor-pointer">
    <input
      ref={ref}
      type="checkbox"
      className={clsx(
        'h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-primary-500 focus:ring-primary-500',
        className
      )}
      {...props}
    />
    {label && <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>}
  </label>
));
Checkbox.displayName = 'Checkbox';
export default Checkbox;
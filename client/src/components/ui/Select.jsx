import { forwardRef } from 'react';
import clsx from 'clsx';

const Select = forwardRef(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={clsx(
      'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500',
      className
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = 'Select';
export default Select;
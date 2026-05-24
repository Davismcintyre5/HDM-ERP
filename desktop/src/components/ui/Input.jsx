import { forwardRef } from 'react';
import clsx from 'clsx';

const Input = forwardRef(({ className, type = 'text', error, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={clsx(
      'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
      error
        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300 dark:border-gray-600',
      'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500',
      className
    )}
    {...props}
  />
));
Input.displayName = 'Input';
export default Input;
import { forwardRef } from 'react';

const Toggle = forwardRef(({ className, label, ...props }, ref) => (
  <label className="inline-flex items-center gap-2 cursor-pointer">
    <div className="relative">
      <input ref={ref} type="checkbox" className="sr-only peer" {...props} />
      <div className="w-9 h-5 bg-gray-300 dark:bg-gray-600 rounded-full peer-checked:bg-primary-500 transition-colors" />
      <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
    </div>
    {label && <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>}
  </label>
));
Toggle.displayName = 'Toggle';
export default Toggle;
import { Fragment } from 'react';
import clsx from 'clsx';
import { X } from 'lucide-react';

const Modal = ({ open, onClose, title, children, className, size }) => {
  if (!open) return null;
  
  const sizeClass = size === 'xl' ? 'max-w-5xl' : size === 'lg' ? 'max-w-2xl' : 'max-w-lg';
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div 
        className={clsx('bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full', sizeClass, className)} 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
};
export default Modal;
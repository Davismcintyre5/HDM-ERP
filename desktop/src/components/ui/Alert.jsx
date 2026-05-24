import clsx from 'clsx';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

const icons = { success: CheckCircle, error: AlertCircle, info: Info };

const Alert = ({ variant = 'info', message, onClose }) => {
  const Icon = icons[variant] || Info;
  const colors = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    error: 'bg-red-50 text-red-800 border-red-300',
    info: 'bg-blue-50 text-blue-800 border-blue-300',
  };
  return (
    <div className={clsx('flex items-center gap-3 px-4 py-3 rounded-lg border', colors[variant])}>
      <Icon size={18} />
      <span className="flex-1 text-sm">{message}</span>
      {onClose && (
        <button onClick={onClose} className="text-current opacity-70 hover:opacity-100">
          <X size={16} />
        </button>
      )}
    </div>
  );
};
export default Alert;
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ current, total, onPageChange }) => (
  <div className="flex items-center gap-2">
    <button onClick={() => onPageChange(current - 1)} disabled={current <= 1} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50">
      <ChevronLeft size={16} />
    </button>
    {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
      <button
        key={p}
        onClick={() => onPageChange(p)}
        className={`w-8 h-8 rounded text-sm ${p === current ? 'bg-primary-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
      >
        {p}
      </button>
    ))}
    <button onClick={() => onPageChange(current + 1)} disabled={current >= total} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50">
      <ChevronRight size={16} />
    </button>
  </div>
);
export default Pagination;
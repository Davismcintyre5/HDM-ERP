import { useState, useRef } from 'react';
import { ChevronDown, Search, X, Plus } from 'lucide-react';

const SearchableSelect = ({ options, value, onChange, placeholder = 'Select...', className = '', clearable = true, creatable = false, onCreate }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const inputRef = useRef(null);
  const closeTimeout = useRef(null);

  const filtered = options.filter(opt => opt.label?.toLowerCase().includes(search.toLowerCase()));
  const selected = options.find(o => o.value === value);
  const exactMatch = options.find(o => o.label.toLowerCase() === search.toLowerCase());
  const showCreate = creatable && search && !exactMatch;

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
    setSearch('');
  };

  const handleCreate = () => {
    if (onCreate) {
      const newVal = onCreate(search);
      onChange(newVal);
    } else {
      onChange(search);
    }
    setOpen(false);
    setSearch('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  const handleBlur = () => {
    // Delay close so click events on list items fire first
    closeTimeout.current = setTimeout(() => setOpen(false), 150);
  };

  const handleFocus = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
  };

  return (
    <div ref={ref} className={`relative ${className}`} onFocus={handleFocus} onBlur={handleBlur}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <span className={selected ? 'truncate' : 'text-gray-400 truncate'}>{selected?.label || placeholder}</span>
        <div className="flex items-center gap-1 shrink-0">
          {clearable && value && (
            <span onMouseDown={handleClear} className="text-gray-400 hover:text-gray-600"><X size={14} /></span>
          )}
          <ChevronDown size={14} className="text-gray-400" />
        </div>
      </button>
      {open && (
        <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-30">
          <div className="flex items-center px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            <Search size={14} className="text-gray-400 mr-2 shrink-0" />
            <input
              ref={inputRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={creatable ? 'Search or type new...' : 'Search...'}
              className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 outline-none"
              autoFocus
            />
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {showCreate && (
              <li
                onMouseDown={(e) => { e.preventDefault(); handleCreate(); }}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-500 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700"
              >
                <Plus size={14} /> Create "{search}"
              </li>
            )}
            {filtered.map(opt => (
              <li
                key={opt.value}
                onMouseDown={(e) => { e.preventDefault(); handleSelect(opt.value); }}
                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  opt.value === value ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-500' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {opt.label}
              </li>
            ))}
            {!filtered.length && !showCreate && (
              <li className="px-3 py-2 text-sm text-gray-400">No results</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
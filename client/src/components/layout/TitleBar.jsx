import { useState, useEffect } from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';

const TitleBar = () => {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (!window.electronAPI) return;
    window.electronAPI.isMaximized().then(setIsMaximized);
    const unsub = window.electronAPI.onMaximizeChange((maximized) => setIsMaximized(maximized));
    return () => { if (typeof unsub === 'function') unsub(); };
  }, []);

  return (
    <div className="h-8 bg-gray-900 dark:bg-gray-950 flex items-center justify-between px-2 select-none shrink-0" style={{ WebkitAppRegion: 'drag' }}>
      <div className="flex items-center gap-2 text-xs text-gray-400 ml-2">
        <img src="/logo.svg" className="h-4 w-4" alt="" />
        <span>HDM ERP</span>
      </div>
      <div className="flex items-center" style={{ WebkitAppRegion: 'no-drag' }}>
        <button onClick={() => window.electronAPI?.minimize()} className="p-2 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
          <Minus size={14} />
        </button>
        <button onClick={() => window.electronAPI?.maximize()} className="p-2 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
          {isMaximized ? <Copy size={12} /> : <Square size={12} />}
        </button>
        <button onClick={() => window.electronAPI?.close()} className="p-2 hover:bg-red-600 text-gray-400 hover:text-white transition-colors">
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
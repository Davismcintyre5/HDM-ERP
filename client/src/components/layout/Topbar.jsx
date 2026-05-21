import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { Menu, LogOut, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Topbar = () => {
  const { user, logout } = useAuth();
  const { toggleMobile } = useSidebar();
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (d) => {
    const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    return d.toLocaleDateString('en-KE', options);
  };

  const formatTime = (d) => {
    return d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 shrink-0">
      <button className="md:hidden p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800" onClick={toggleMobile}>
        <Menu size={20} />
      </button>

      <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 ml-auto mr-4">
        <Clock size={14} />
        <span>{formatDate(time)}</span>
        <span className="font-medium text-gray-700 dark:text-gray-300">{formatTime(time)}</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-medium">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="hidden sm:block text-right leading-tight">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-gray-100 dark:hover:bg-gray-800" title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
};
export default Topbar;
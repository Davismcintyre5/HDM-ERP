import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from '../../context/SidebarContext';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, User, Settings, Clock, ChevronDown } from 'lucide-react';

const Topbar = () => {
  const { user, logout } = useAuth();
  const { toggleMobile } = useSidebar();
  const [time, setTime] = useState(new Date());
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const formatDate = (d) => d.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const formatTime = (d) => d.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 shrink-0">
{/* Left: Mobile menu + Greeting */}
<div className="flex items-center gap-3">
  <button className="md:hidden p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800" onClick={toggleMobile}>
    <Menu size={20} />
  </button>
  <div>
    <div className="text-sm">
      <span className="text-gray-500 dark:text-gray-400">{getGreeting()}, </span>
      <strong className="text-gray-700 dark:text-gray-300">{user?.firstName || 'User'}</strong>
    </div>
    <p className="text-[10px] text-gray-400 dark:text-gray-500 capitalize">{user?.role?.replace('_', ' ') || 'Staff'}</p>
  </div>
</div>

      {/* Right: Time + Profile */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
          <Clock size={12} />
          <span>{formatDate(time)}</span>
          <span className="font-medium text-gray-600 dark:text-gray-400">{formatTime(time)}</span>
        </div>

        {/* Profile Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-medium">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
              <button onClick={() => { navigate('/dashboard'); setDropdownOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"><User size={14} /> My Dashboard</button>
              <button onClick={() => { navigate('/settings/company'); setDropdownOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"><Settings size={14} /> Settings</button>
              <hr className="border-gray-100 dark:border-gray-700" />
              <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"><LogOut size={14} /> Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
export default Topbar;
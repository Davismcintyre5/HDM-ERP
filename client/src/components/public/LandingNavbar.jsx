import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Menu, X, ChevronDown } from 'lucide-react';
import Button from '../ui/Button';

const LandingNavbar = ({ config, onOpenLegal, onOpenContact }) => {
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const navigate = useNavigate();

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button onClick={scrollToTop} className="flex items-center gap-2 text-xl font-bold text-primary-500">
            <img src="/logo.svg" className="h-8 w-8" alt="HDM" />
            {config?.systemName || 'HDM ERP'}
          </button>

          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => scrollTo('features')} className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-500">Features</button>
            <button onClick={() => scrollTo('about')} className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-500">About</button>
            <div className="relative" onMouseEnter={() => setSupportOpen(true)} onMouseLeave={() => setSupportOpen(false)}>
              <button className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-primary-500">Support <ChevronDown size={14} /></button>
              {supportOpen && (
                <div className="absolute top-full mt-1 w-44 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  <button onClick={() => { onOpenContact(); setSupportOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Contact Us</button>
                  <button onClick={() => { navigate('/faqs'); setSupportOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">FAQs</button>
                  <button onClick={() => { navigate('/help'); setSupportOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Help Center</button>
                  <hr className="border-gray-200 dark:border-gray-700" />
                  <button onClick={() => { onOpenLegal('privacy_policy'); setSupportOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Privacy</button>
                  <button onClick={() => { onOpenLegal('terms_of_service'); setSupportOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Terms</button>
                </div>
              )}
            </div>
            <a href="#pricing" onClick={(e) => { e.preventDefault(); scrollTo('pricing'); }} className="text-sm font-medium text-primary-500 hover:text-primary-600">Pricing</a>
            <Button variant="ghost" onClick={toggleTheme}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}</Button>

            {isAuthenticated ? (
              <Link to="/dashboard"><Button>🚀 Launch App</Button></Link>
            ) : (
              <>
                <Link to="/login"><Button variant="outline">Login</Button></Link>
                <Link to="/pricing"><Button>Get Started</Button></Link>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <button onClick={() => scrollTo('features')} className="block w-full text-left py-2 text-sm text-gray-600 dark:text-gray-300">Features</button>
          <button onClick={() => scrollTo('about')} className="block w-full text-left py-2 text-sm text-gray-600 dark:text-gray-300">About</button>
          <a href="#pricing" onClick={(e) => { e.preventDefault(); scrollTo('pricing'); }} className="block py-2 text-sm text-primary-500 font-medium">Pricing</a>
          <hr className="border-gray-200 dark:border-gray-700" />
          <button onClick={() => { onOpenContact(); setMobileOpen(false); }} className="block w-full text-left py-2 text-sm text-gray-600 dark:text-gray-300">Contact</button>
          <button onClick={() => { navigate('/faqs'); setMobileOpen(false); }} className="block w-full text-left py-2 text-sm text-gray-600 dark:text-gray-300">FAQs</button>
          <button onClick={() => { navigate('/help'); setMobileOpen(false); }} className="block w-full text-left py-2 text-sm text-gray-600 dark:text-gray-300">Help Center</button>
          <button onClick={() => { onOpenLegal('privacy_policy'); setMobileOpen(false); }} className="block w-full text-left py-2 text-sm text-gray-600 dark:text-gray-300">Privacy</button>
          <button onClick={() => { onOpenLegal('terms_of_service'); setMobileOpen(false); }} className="block w-full text-left py-2 text-sm text-gray-600 dark:text-gray-300">Terms</button>
          <div className="pt-2 space-y-2">
            {isAuthenticated ? (
              <Link to="/dashboard" className="block w-full"><Button className="w-full">🚀 Launch App</Button></Link>
            ) : (
              <>
                <Link to="/login" className="block w-full"><Button variant="outline" className="w-full">Login</Button></Link>
                <Link to="/pricing" className="block w-full"><Button className="w-full">Get Started</Button></Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;
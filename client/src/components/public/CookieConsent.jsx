import { useState } from 'react';
import { useApp } from '../../context/AppContext';

const CookieConsent = () => {
  const [hidden, setHidden] = useState(localStorage.getItem('cookieConsent') === 'true');
  const { openLegal } = useApp();

  const accept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setHidden(true);
  };

  const decline = () => {
    localStorage.setItem('cookieConsent', 'false');
    setHidden(true);
  };

  if (hidden) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg px-6 py-4">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
          We use cookies to improve your experience. By continuing, you agree to our{' '}
          <button
            onClick={() => openLegal('cookie_policy')}
            className="text-primary-500 hover:underline font-medium"
          >
            Cookie Policy
          </button>
          .
        </p>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={decline}
            className="px-5 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="px-5 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
import { useNavigate } from 'react-router-dom';

const LandingFooter = ({ config, onOpenLegal, onOpenContact }) => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
        <div>
          <h3 className="text-white font-semibold text-sm">HDM ERP</h3>
          <p className="mt-1 text-xs opacity-70">Smart Business Management</p>
        </div>
        <div>
          <h4 className="text-white font-medium text-xs mb-2">Features</h4>
          <ul className="space-y-0.5 text-xs opacity-70">
            {(config?.moduleTags || ['Finance','HR','Sales']).slice(0,4).map(t => <li key={t}>{t}</li>)}
          </ul>
        </div>
        <div>
          <h4 className="text-white font-medium text-xs mb-2">Support</h4>
          <div className="space-y-0.5 text-xs opacity-70">
            <button onClick={onOpenContact} className="hover:text-primary-400 block">Contact</button>
            <button onClick={() => navigate('/faqs')} className="hover:text-primary-400 block">FAQs</button>
            <button onClick={() => navigate('/help')} className="hover:text-primary-400 block">Help</button>
          </div>
        </div>
        <div>
          <h4 className="text-white font-medium text-xs mb-2">Legal</h4>
          <div className="space-y-0.5 text-xs opacity-70">
            <button onClick={() => onOpenLegal('privacy_policy')} className="hover:text-primary-400 block">Privacy Policy</button>
            <button onClick={() => onOpenLegal('terms_of_service')} className="hover:text-primary-400 block">Terms of Service</button>
            <button onClick={() => onOpenLegal('license_agreement')} className="hover:text-primary-400 block">License</button>
            <button onClick={() => onOpenLegal('cookie_policy')} className="hover:text-primary-400 block">Cookies</button>
          </div>
        </div>
      </div>
      <div className="text-center text-xs mt-6 border-t border-gray-800 pt-4 opacity-50">
        © 2026 HDM ERP
      </div>
    </footer>
  );
};

export default LandingFooter;
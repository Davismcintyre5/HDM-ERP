import { useApp } from '../../context/AppContext';
import LandingNavbar from '../../components/public/LandingNavbar';
import { Book, Video, FileText, MessageCircle } from 'lucide-react';

const HelpPage = () => {
  const { openLegal, openContact } = useApp();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <LandingNavbar config={{}} onOpenLegal={openLegal} onOpenContact={openContact} />
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Help Center</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-12">Everything you need to get started with HDM ERP</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Book, title: 'Documentation', desc: 'Read our comprehensive guides and tutorials.' },
            { icon: Video, title: 'Video Tutorials', desc: 'Watch step-by-step video walkthroughs.' },
            { icon: FileText, title: 'API Reference', desc: 'Explore our API for custom integrations.' },
          ].map((item, i) => (
            <div key={i} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
              <item.icon size={40} className="text-primary-500 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 p-8 bg-primary-50 dark:bg-primary-900 rounded-lg">
          <MessageCircle size={32} className="text-primary-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Still need help?</h3>
          <button onClick={openContact} className="text-primary-500 hover:underline font-medium">Contact Support →</button>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
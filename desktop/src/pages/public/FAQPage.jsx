import { useEffect, useState } from 'react';
import { getLandingConfig } from '../../api/public/landingApi';
import { useApp } from '../../context/AppContext';
import LandingNavbar from '../../components/public/LandingNavbar';
import Spinner from '../../components/ui/Spinner';

const FAQPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { openLegal, openContact } = useApp();

  useEffect(() => {
    getLandingConfig()
      .then(res => setFaqs(res.data.data?.faqs?.questions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <LandingNavbar config={{}} onOpenLegal={openLegal} onOpenContact={openContact} />
      <div className="max-w-3xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-10 text-center">Frequently Asked Questions</h1>
        <div className="space-y-4">
          {faqs.length > 0 ? faqs.map((faq, i) => (
            <details key={i} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 cursor-pointer">
              <summary className="font-semibold text-gray-900 dark:text-white">{faq.q}</summary>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">{faq.a}</p>
            </details>
          )) : (
            <p className="text-center text-gray-500">No FAQs available.</p>
          )}
        </div>
        <p className="text-center text-sm text-gray-400 mt-12">
          Still have questions? <button onClick={openContact} className="text-primary-500 hover:underline">Contact us</button>
        </p>
      </div>
    </div>
  );
};

export default FAQPage;
import { useAI } from '../../context/AIContext';
import { MessageCircle, X } from 'lucide-react';

const SparkleButton = () => {
  const { chatOpen, toggleChat, aiEnabled, checked } = useAI();

  // Don't show anything until we've checked settings
  if (!checked) return null;
  // Don't show if AI is disabled
  if (!aiEnabled) return null;

  return (
    <button
      onClick={toggleChat}
      className="fixed bottom-4 right-4 z-40 p-3 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-colors"
      title="AI Assistant"
    >
      {chatOpen ? <X size={24} /> : <MessageCircle size={24} />}
    </button>
  );
};

export default SparkleButton;
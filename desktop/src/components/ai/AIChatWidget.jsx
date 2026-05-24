import { useState, useRef, useEffect } from 'react';
import { useAI } from '../../context/AIContext';
import { Send, X, Trash2, Sparkles } from 'lucide-react';
import Spinner from '../ui/Spinner';

const AIChatWidget = () => {
  const { chatOpen, toggleChat, messages, sendQuery, loading, clearChat } = useAI();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    sendQuery(input);
    setInput('');
  };

  if (!chatOpen) return null;

  return (
    <div className="fixed bottom-16 right-4 z-40 w-80 h-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary-500 text-white rounded-t-xl">
        <div className="flex items-center gap-2">
          <Sparkles size={18} />
          <span className="font-medium text-sm">AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={clearChat} className="p-1 hover:bg-primary-600 rounded" title="Clear chat"><Trash2 size={14} /></button>
          <button onClick={toggleChat} className="p-1 hover:bg-primary-600 rounded"><X size={18} /></button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-gray-500 mt-10">
            <Sparkles size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-xs">Ask me anything about your business!</p>
            <div className="flex flex-wrap gap-1 mt-3 justify-center">
              {['Show revenue', 'Low stock items', 'Recent orders', 'Cash flow'].map(s => (
                <button
                  key={s}
                  onClick={() => sendQuery(s)}
                  className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-500 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-3 py-2 rounded-lg whitespace-pre-wrap break-words ${
                msg.role === 'user'
                  ? 'bg-primary-500 text-white rounded-br-none'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
              }`}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg rounded-bl-none"><Spinner /></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask about your data..."
          className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <button onClick={handleSend} disabled={loading} className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export default AIChatWidget;
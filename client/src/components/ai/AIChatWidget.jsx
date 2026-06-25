import { useState, useRef, useEffect, useCallback } from 'react';
import { useAI } from '../../context/AIContext';
import { Send, X, Trash2, Sparkles, History, MessageSquare, ChevronRight } from 'lucide-react';
import Spinner from '../ui/Spinner';

const AIChatWidget = () => {
  const { chatOpen, toggleChat, messages, sendQuery, loading, clearChat } = useAI();
  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Local chat history (stored in localStorage)
  const [chatHistory, setChatHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('ai_chat_history') || '[]');
    } catch { return []; }
  });

  // Save current chat to history
  const saveToHistory = useCallback(() => {
    if (messages.length === 0) return;
    const session = {
      id: Date.now(),
      title: messages[0]?.content?.slice(0, 40) || 'New chat',
      date: new Date().toISOString(),
      messages: [...messages]
    };
    const updated = [session, ...chatHistory].slice(0, 50); // Keep last 50
    setChatHistory(updated);
    localStorage.setItem('ai_chat_history', JSON.stringify(updated));
  }, [messages, chatHistory]);

  // Load history session
  const loadHistory = (session) => {
    // Save current first
    if (messages.length > 0) saveToHistory();
    // Load the session messages into context
    clearChat();
    session.messages.forEach(msg => {
      // Re-populate via context — we need a way to set messages
      // For now, we'll just replay the queries
    });
    // Simpler approach: restore messages directly
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (chatOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [chatOpen]);

  const handleSend = useCallback(() => {
    if (!input.trim() || loading) return;
    sendQuery(input.trim());
    setInput('');
  }, [input, loading, sendQuery]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    if (messages.length > 0) {
      saveToHistory();
    }
    clearChat();
  };

  const handleDeleteHistory = (id) => {
    const updated = chatHistory.filter(h => h.id !== id);
    setChatHistory(updated);
    localStorage.setItem('ai_chat_history', JSON.stringify(updated));
  };

  const handleClearAllHistory = () => {
    setChatHistory([]);
    localStorage.removeItem('ai_chat_history');
  };

  if (!chatOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40" onClick={toggleChat} />

      {/* Panel — half page width from left */}
      <div className="fixed left-0 top-0 bottom-0 z-50 w-[45vw] min-w-[420px] max-w-[600px] bg-white dark:bg-gray-800 shadow-2xl border-r border-gray-200 dark:border-gray-700 flex animate-slide-in">
        
        {/* History Sidebar */}
        {showHistory && (
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Chat History</span>
              <button onClick={() => setShowHistory(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {chatHistory.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">No history yet</p>
              ) : (
                chatHistory.map(h => (
                  <div key={h.id} className="flex items-center gap-2 px-2 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 group cursor-pointer" onClick={() => {
                    clearChat();
                    h.messages.forEach(msg => {
                      if (msg.role === 'user') sendQuery(msg.content);
                    });
                    setShowHistory(false);
                  }}>
                    <MessageSquare size={12} className="text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1">{h.title}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteHistory(h.id); }} className="p-0.5 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
            {chatHistory.length > 0 && (
              <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                <button onClick={handleClearAllHistory} className="w-full text-xs text-red-500 hover:text-red-600 py-1">
                  Clear All History
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary-500 text-white shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={() => setShowHistory(!showHistory)} className="p-1 hover:bg-primary-600 rounded" title="History">
                <History size={18} />
              </button>
              <Sparkles size={18} />
              <span className="font-medium text-sm">AI Assistant</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleClearChat} className="p-1 hover:bg-primary-600 rounded text-white/80 hover:text-white" title="Clear chat">
                <Trash2 size={14} />
              </button>
              <button onClick={toggleChat} className="p-1 hover:bg-primary-600 rounded">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
            {messages.length === 0 ? (
              <div className="text-center text-gray-400 dark:text-gray-500 mt-16">
                <Sparkles size={48} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ask me anything about your business!</p>
                <p className="text-xs mt-1">I can analyze data, generate reports, and provide insights.</p>
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {['📊 Show revenue this month', '📦 Low stock items', '📋 Recent orders', '💰 Cash flow summary', '👥 Employee count', '📈 Sales trends'].map(s => (
                    <button key={s} onClick={() => sendQuery(s)} className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-500 transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl whitespace-pre-wrap break-words text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-primary-500 text-white rounded-br-md' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-md'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-2">
                  <Spinner />
                  <span className="text-xs text-gray-400">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 shrink-0">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about your data... (Enter to send, Shift+Enter for new line)"
                  rows={2}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
                <span className="absolute right-3 bottom-2 text-[10px] text-gray-400">{input.length}/2000</span>
              </div>
              <button 
                onClick={handleSend} 
                disabled={loading || !input.trim()} 
                className="p-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                title="Send (Enter)"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">
              AI responses may not always be accurate. Verify important information.
            </p>
          </div>
        </div>
      </div>

      {/* Slide-in animation */}
      <style>{`
        @keyframes slideIn { from { transform: translateX(-30%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .animate-slide-in { animation: slideIn 0.25s ease-out; }
      `}</style>
    </>
  );
};

export default AIChatWidget;
import { createContext, useContext, useState, useEffect } from 'react';
import { queryAI } from '../api/tenant/aiQueryApi';
import api from '../api/axios';

const AIContext = createContext(null);

export const AIProvider = ({ children }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) {
      setChecked(true);
      return;
    }

    // Check once on mount, then never again
    api.get('/tenant/ai/settings')
      .then(res => setAiEnabled(res.data.data?.enabled !== false))
      .catch(() => setAiEnabled(false))
      .finally(() => setChecked(true));
  }, []); // Empty dependency — runs once

  const sendQuery = async (question) => {
    if (!aiEnabled) return;
    setLoading(true);
    const newMessages = [...messages, { role: 'user', content: question }];
    setMessages(newMessages);
    try {
      const { data } = await queryAI(question);
      const reply = data.data?.reply || data.data?.data?.reply || data?.reply || 'No response';
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      if (err.response?.status === 403) setAiEnabled(false);
      setMessages([...newMessages, { role: 'assistant', content: 'AI unavailable' }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleChat = () => { if (aiEnabled) setChatOpen(!chatOpen); };
  const clearChat = () => setMessages([]);

  return (
    <AIContext.Provider value={{ chatOpen, toggleChat, messages, sendQuery, loading, clearChat, aiEnabled, checked }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => useContext(AIContext);
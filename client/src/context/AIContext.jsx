import { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AIContext = createContext(null);

export const AIProvider = ({ children }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendQuery = async (question) => {
    setLoading(true);
    const newMessages = [...messages, { role: 'user', content: question }];
    setMessages(newMessages);
    try {
      const { data } = await api.post('/tenant/ai/query', { question });
      const reply = data.data?.reply || 'No response';
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'AI service unavailable' }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleChat = () => setChatOpen(!chatOpen);

  return (
    <AIContext.Provider value={{ chatOpen, toggleChat, messages, sendQuery, loading }}>
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => useContext(AIContext);
import { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { queryAI } from '../../api/tenant/aiApi';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import HeaderBar from '../../components/layout/HeaderBar';
import Spinner from '../../components/ui/Spinner';
import { useAuth } from '../../hooks/useAuth';

const AIChatScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hello ${user?.firstName || 'there'}! How can I help you today? Ask me about your business data.` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await queryAI(input.trim());
      const reply = data.data?.reply || data?.reply || 'No response available.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'AI service is currently unavailable. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'assistant', content: `Hello ${user?.firstName || 'there'}! How can I help you today?` }]);
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <HeaderBar
        title="AI Assistant"
        rightAction={{ icon: 'trash-outline', onPress: clearChat }}
      />
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
            {item.role === 'assistant' && (
              <View style={styles.aiAvatar}>
                <Ionicons name="sparkles" size={14} color="#10B981" />
              </View>
            )}
            <View style={[styles.bubbleContent, item.role === 'user' ? styles.userBubbleContent : styles.aiBubbleContent]}>
              <Text style={[styles.bubbleText, item.role === 'user' ? styles.userText : styles.aiText]}>
                {item.content}
              </Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.chatList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Suggestions */}
      {messages.length <= 1 && (
        <View style={styles.suggestions}>
          {['Show revenue', 'Low stock items', 'Business overview', 'Recent orders'].map(s => (
            <TouchableOpacity key={s} onPress={() => { setInput(s); sendMessage(); }} style={styles.suggestionChip}>
              <Text style={styles.suggestionText}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask about your business..."
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          multiline
          maxLength={500}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity onPress={sendMessage} disabled={loading || !input.trim()} style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}>
          {loading ? <Spinner size="small" color="#fff" /> : <Ionicons name="send" size={18} color="#fff" />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F9FAFB' },
  chatList: { padding: 16, paddingBottom: 8 },
  bubble: { flexDirection: 'row', marginBottom: 14, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end' },
  aiBubble: { alignSelf: 'flex-start' },
  aiAvatar: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#D1FAE5',
    justifyContent: 'center', alignItems: 'center', marginRight: 8, alignSelf: 'flex-end',
  },
  bubbleContent: { padding: 12, borderRadius: 16 },
  userBubbleContent: { backgroundColor: '#10B981', borderBottomRightRadius: 4 },
  aiBubbleContent: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  userText: { color: '#FFFFFF' },
  aiText: { color: '#111827' },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: 16, paddingBottom: 8 },
  suggestionChip: { backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  suggestionText: { fontSize: 12, color: '#10B981', fontWeight: '500' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', gap: 8 },
  input: {
    flex: 1, backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 14, maxHeight: 100, color: '#111827',
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#10B981',
    justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#D1D5DB' },
});

export default AIChatScreen;
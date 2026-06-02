import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Alert = ({ variant = 'info', message, onClose }) => {
  const bg = variant === 'success' ? '#D1FAE5' : variant === 'error' ? '#FEE2E2' : '#DBEAFE';
  const textColor = variant === 'success' ? '#065F46' : variant === 'error' ? '#991B1B' : '#1E40AF';
  const borderColor = variant === 'success' ? '#10B981' : variant === 'error' ? '#EF4444' : '#3B82F6';

  return (
    <View style={[styles.container, { backgroundColor: bg, borderLeftColor: borderColor }]}>
      <Text style={[styles.message, { color: textColor }]}>{message}</Text>
      {onClose && (
        <TouchableOpacity onPress={onClose}>
          <Text style={[styles.close, { color: textColor }]}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 8, borderLeftWidth: 4, marginBottom: 12 },
  message: { flex: 1, fontSize: 14, fontWeight: '500' },
  close: { fontSize: 16, marginLeft: 10, fontWeight: '700' },
});

export default Alert;
import { View, Text, StyleSheet } from 'react-native';
import { getStatusColor } from '../../utils/statusColors';

const Badge = ({ children, variant = 'default' }) => {
  const colors = getStatusColor(variant);
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, alignSelf: 'flex-start' },
  text: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
});

export default Badge;
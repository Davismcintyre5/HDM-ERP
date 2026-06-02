import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ListItem = ({ title, subtitle, value, badge, onPress, icon, rightIcon = 'chevron-forward' }) => (
  <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
    {icon && <Ionicons name={icon} size={22} color="#10B981" style={styles.icon} />}
    <View style={styles.content}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
    <View style={styles.right}>
      {value && <Text style={styles.value}>{value}</Text>}
      {badge}
      <Ionicons name={rightIcon} size={16} color="#D1D5DB" />
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  icon: { marginRight: 12 },
  content: { flex: 1 },
  title: { fontSize: 15, fontWeight: '500', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  value: { fontSize: 14, color: '#10B981', fontWeight: '600' },
});

export default ListItem;
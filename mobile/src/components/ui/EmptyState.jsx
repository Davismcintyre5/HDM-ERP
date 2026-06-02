import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EmptyState = ({ icon = 'cube-outline', title = 'No data', description = '' }) => (
  <View style={styles.container}>
    <Ionicons name={icon} size={48} color="#D1D5DB" />
    <Text style={styles.title}>{title}</Text>
    {description ? <Text style={styles.desc}>{description}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  title: { fontSize: 17, fontWeight: '600', color: '#6B7280', marginTop: 12 },
  desc: { fontSize: 13, color: '#9CA3AF', marginTop: 4, textAlign: 'center' },
});

export default EmptyState;
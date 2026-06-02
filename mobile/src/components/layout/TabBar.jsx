import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TabBar = ({ tabs, active, onChange }) => (
  <View style={styles.container}>
    {tabs.map(tab => (
      <TouchableOpacity
        key={tab.key}
        onPress={() => onChange(tab.key)}
        style={[styles.tab, active === tab.key && styles.activeTab]}
      >
        <Ionicons name={tab.icon} size={18} color={active === tab.key ? '#10B981' : '#6B7280'} />
        <Text style={[styles.label, active === tab.key && styles.activeLabel]}>{tab.label}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, gap: 2 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#10B981' },
  label: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
  activeLabel: { color: '#10B981', fontWeight: '600' },
});

export default TabBar;
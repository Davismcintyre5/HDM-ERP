import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import HeaderBar from '../components/layout/HeaderBar';

const businessItems = [
  { title: 'Finance', icon: 'wallet-outline', screen: 'Finance', desc: 'Accounts, invoices, bills, journal', color: '#10B981' },
  { title: 'Sales', icon: 'cart-outline', screen: 'Sales', desc: 'Orders, quotations, pricing', color: '#3B82F6' },
  { title: 'Inventory', icon: 'cube-outline', screen: 'Inventory', desc: 'Stock, movements, warehouses', color: '#F59E0B' },
  { title: 'Supply Chain', icon: 'airplane-outline', screen: 'SupplyChain', desc: 'POs, receiving, suppliers', color: '#8B5CF6' },
  { title: 'Manufacturing', icon: 'hammer-outline', screen: 'Manufacturing', desc: 'BOMs, work orders, QC', color: '#EF4444' },
];

const BusinessScreen = ({ navigation }) => (
  <View style={styles.flex}>
    <HeaderBar title="Business" />
    <ScreenWrapper>
      <Text style={styles.heading}>Business Modules</Text>
      {businessItems.map(item => (
        <TouchableOpacity
          key={item.screen}
          style={styles.card}
          onPress={() => navigation.navigate(item.screen)}
        >
          <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
            <Ionicons name={item.icon} size={24} color={item.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.desc}>{item.desc}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
        </TouchableOpacity>
      ))}
    </ScreenWrapper>
  </View>
);

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F9FAFB' },
  heading: { fontSize: 14, fontWeight: '600', color: '#6B7280', paddingHorizontal: 16, marginBottom: 8, marginTop: 8 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 8,
    borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB',
  },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '600', color: '#111827' },
  desc: { fontSize: 12, color: '#6B7280', marginTop: 2 },
});

export default BusinessScreen;
import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getUnifiedOrders } from '../../api/tenant/ordersApi';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import HeaderBar from '../../components/layout/HeaderBar';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';

const statusColors = { draft: 'default', confirmed: 'info', processing: 'warning', shipped: 'info', delivered: 'success', invoiced: 'info', paid: 'success', cancelled: 'danger', completed: 'success', pending: 'warning' };

const OrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getUnifiedOrders().then(res => setOrders(res.data.data || [])).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.orderType === filter);

  if (loading) return <Spinner />;

  return (
    <View style={styles.flex}>
      <HeaderBar title="All Orders" />
      <ScreenWrapper scrollable={false}>
        <View style={styles.filterRow}>
          {['all', 'sales', 'purchase', 'work'].map(f => (
            <TouchableOpacity key={f} onPress={() => setFilter(f)} style={[styles.filterBtn, filter === f && styles.filterActive]}>
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.orderNumber}>{item.orderNumber}</Text>
                <Text style={styles.orderCustomer}>{item.customer?.companyName || item.supplier?.companyName || item.product?.name || 'N/A'}</Text>
                <Text style={styles.orderDate}>{formatDate(item.orderDate || item.createdAt)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Badge variant={item.orderType === 'sales' ? 'info' : item.orderType === 'purchase' ? 'warning' : 'success'}>{item.orderType}</Badge>
                <Badge variant={statusColors[item.status] || 'default'}>{item.status}</Badge>
                <Text style={styles.orderAmount}>{formatCurrency(item.grandTotal || 0)}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="layers-outline" title="No orders" />}
        />
      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F9FAFB' },
  filterRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, marginBottom: 8 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F3F4F6' },
  filterActive: { backgroundColor: '#10B981' },
  filterText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  filterTextActive: { color: '#FFFFFF' },
  list: { padding: 16, paddingTop: 4 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFFFFF', padding: 14, borderRadius: 10, marginBottom: 8,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  orderNumber: { fontSize: 15, fontWeight: '600', color: '#111827' },
  orderCustomer: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  orderDate: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  orderAmount: { fontSize: 14, fontWeight: '700', color: '#10B981' },
});

export default OrdersScreen;
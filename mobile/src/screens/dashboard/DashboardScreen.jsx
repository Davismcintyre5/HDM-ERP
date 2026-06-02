import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMetrics } from '../../api/tenant/dashboardApi';
import { useTenant } from '../../hooks/useTenant';
import { useAuth } from '../../hooks/useAuth';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await getMetrics();
      setMetrics(res.data.data);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMetrics();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) return <Spinner />;

  const stats = [
    { label: 'Total Customers', value: metrics?.totalCustomers || 0, icon: 'people', color: '#3B82F6', bg: '#DBEAFE' },
    { label: 'Open Invoices', value: metrics?.openInvoices?.count || 0, icon: 'document-text', color: '#F59E0B', bg: '#FEF3C7', sub: formatCurrency(metrics?.openInvoices?.total || 0) },
    { label: 'Revenue', value: formatCurrency(metrics?.revenue || 0), icon: 'trending-up', color: '#10B981', bg: '#D1FAE5' },
    { label: 'Low Stock', value: metrics?.lowStockItems || 0, icon: 'warning', color: '#EF4444', bg: '#FEE2E2' },
    { label: 'Income', value: formatCurrency(metrics?.cashFlow?.income || 0), icon: 'arrow-down', color: '#10B981', bg: '#D1FAE5' },
    { label: 'Expenses', value: formatCurrency(metrics?.cashFlow?.expenses || 0), icon: 'arrow-up', color: '#EF4444', bg: '#FEE2E2' },
  ];

  return (
    <ScreenWrapper refreshing={refreshing} onRefresh={onRefresh}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}, {user?.firstName || 'User'} 👋</Text>
          <Text style={styles.company}>{tenant?.companyName || 'HDM ERP'}</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.firstName?.[0]}{user?.lastName?.[0]}</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.grid}>
        {stats.map((stat, i) => (
          <Card key={i} style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: stat.bg }]}>
              <Ionicons name={stat.icon} size={20} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
            {stat.sub && <Text style={styles.statSub}>{stat.sub}</Text>}
          </Card>
        ))}
      </View>

      {/* Recent Orders */}
      {metrics?.recentOrders?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          {metrics.recentOrders.slice(0, 5).map(order => (
            <View key={order._id} style={styles.orderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Badge variant={order.status}>{order.status}</Badge>
                <Text style={styles.orderAmount}>{formatCurrency(order.grandTotal || 0)}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {!metrics?.totalCustomers && !metrics?.recentOrders?.length && (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyText}>No data yet</Text>
          <Text style={styles.emptySub}>Start by adding customers, products, or creating invoices.</Text>
        </View>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20,
    backgroundColor: '#10B981',
  },
  greeting: { fontSize: 16, color: '#FFFFFF', fontWeight: '500' },
  company: { fontSize: 13, color: '#D1FAE5', marginTop: 2 },
  avatar: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#10B981' },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 10,
    marginTop: -10,
  },
  statCard: {
    width: '47%', padding: 14, alignItems: 'center',
  },
  iconBox: {
    width: 40, height: 40, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginBottom: 8,
  },
  statValue: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 2 },
  statLabel: { fontSize: 12, color: '#6B7280', textAlign: 'center' },
  statSub: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  section: { paddingHorizontal: 16, marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
  orderRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFFFFF', padding: 14, borderRadius: 10,
    marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB',
  },
  orderNumber: { fontSize: 14, fontWeight: '600', color: '#111827' },
  orderDate: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  orderAmount: { fontSize: 14, fontWeight: '600', color: '#10B981' },
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 17, fontWeight: '600', color: '#6B7280', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#9CA3AF', marginTop: 4, textAlign: 'center' },
});

export default DashboardScreen;
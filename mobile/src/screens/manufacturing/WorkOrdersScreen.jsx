import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getWorkOrders, createWorkOrder, updateWorkOrderStatus } from '../../api/tenant/manufacturingApi';
import { getProducts } from '../../api/tenant/productsApi';
import api from '../../api/axios';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import HeaderBar from '../../components/layout/HeaderBar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import FloatingAction from '../../components/ui/FloatingAction';
import formatDate from '../../utils/formatDate';

const statusFlow = ['draft', 'confirmed', 'processing', 'completed'];
const statusColors = { draft: 'default', confirmed: 'info', processing: 'warning', completed: 'success', cancelled: 'danger' };
const emptyForm = { product: '', quantity: 1, scheduledStart: '', scheduledEnd: '' };

const WorkOrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewWO, setViewWO] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      const [wRes, pRes] = await Promise.all([getWorkOrders(), getProducts()]);
      setOrders(wRes.data.data || []);
      setProducts(pRes.data.data || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleCreate = async () => {
    if (!form.product) return;
    setSaving(true);
    try { await createWorkOrder(form); setShowForm(false); setForm(emptyForm); fetchOrders(); } catch (err) { setMessage(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const advanceStatus = async (id, current) => {
    const idx = statusFlow.indexOf(current);
    if (idx < statusFlow.length - 1) {
      try { await updateWorkOrderStatus(id, statusFlow[idx + 1]); fetchOrders(); } catch {}
    }
  };

  if (loading) return <Spinner />;

  return (
    <View style={styles.flex}>
      <HeaderBar title="Work Orders" onBack={() => navigation.goBack()} />
      <ScreenWrapper scrollable={false}>
        <FlatList
          data={orders}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => advanceStatus(item._id, item.status)} activeOpacity={0.7}>
              <View style={{ flex: 1 }}>
                <Text style={styles.woNumber}>{item.orderNumber}</Text>
                <Text style={styles.woProduct}>{item.product?.name || 'N/A'}</Text>
                <Text style={styles.woDate}>{formatDate(item.scheduledStart)} — {formatDate(item.scheduledEnd)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Badge variant={statusColors[item.status] || 'default'}>{item.status}</Badge>
                <Text style={styles.woOutput}>Output: {item.outputQuantity || 0}</Text>
                {item.status !== 'completed' && item.status !== 'cancelled' && (
                  <Text style={styles.nextStatus}>→ {statusFlow[statusFlow.indexOf(item.status) + 1]}</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="construct-outline" title="No work orders" />}
        />
      </ScreenWrapper>
      <FloatingAction icon="add" onPress={() => { setForm(emptyForm); setShowForm(true); }} />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Work Order">
        <Select label="Product *" value={form.product} onValueChange={(v) => setForm(p => ({ ...p, product: v }))} options={products.map(p => ({ label: p.name, value: p._id }))} placeholder="Select product" />
        <Input label="Quantity" value={String(form.quantity)} onChangeText={(v) => setForm(p => ({ ...p, quantity: parseInt(v) || 1 }))} keyboardType="numeric" />
        <Input label="Scheduled Start" value={form.scheduledStart} onChangeText={(v) => setForm(p => ({ ...p, scheduledStart: v }))} />
        <Input label="Scheduled End" value={form.scheduledEnd} onChangeText={(v) => setForm(p => ({ ...p, scheduledEnd: v }))} />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <Button title="Cancel" variant="ghost" onPress={() => setShowForm(false)} style={{ flex: 1 }} />
          <Button title="Create WO" onPress={handleCreate} loading={saving} style={{ flex: 1 }} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F9FAFB' },
  list: { padding: 16, paddingTop: 8 },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFFFFF', padding: 14, borderRadius: 10, marginBottom: 8,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  woNumber: { fontSize: 15, fontWeight: '600', color: '#111827' },
  woProduct: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  woDate: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  woOutput: { fontSize: 14, fontWeight: '700', color: '#10B981' },
  nextStatus: { fontSize: 10, color: '#10B981', fontWeight: '500' },
});

export default WorkOrdersScreen;
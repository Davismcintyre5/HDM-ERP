import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getRequisitions, createRequisition } from '../../api/tenant/supplyChainApi';
import { getProducts } from '../../api/tenant/productsApi';
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

const priorities = ['low', 'medium', 'high'];
const emptyForm = { product: '', quantity: 1, reason: '', requestedBy: '', department: '', priority: 'medium' };

const RequisitionsScreen = ({ navigation }) => {
  const [requisitions, setRequisitions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [rRes, pRes] = await Promise.all([getRequisitions(), getProducts()]);
      setRequisitions(rRes.data.data || []);
      setProducts(pRes.data.data || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async () => {
    if (!form.product) return setMessage('Product required');
    setSaving(true);
    try { await createRequisition(form); setShowForm(false); setForm(emptyForm); fetchData(); } catch (err) { setMessage(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <View style={styles.flex}>
      <HeaderBar title="Requisitions" onBack={() => navigation.goBack()} />
      <ScreenWrapper scrollable={false}>
        <FlatList
          data={requisitions}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.reqProduct}>{item.product?.name || '—'}</Text>
                <Text style={styles.reqDept}>{item.department || '—'} • {item.requestedBy || '—'}</Text>
                <Text style={styles.reqDate}>{formatDate(item.createdAt)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Badge variant={item.priority === 'high' ? 'danger' : item.priority === 'medium' ? 'warning' : 'info'}>{item.priority}</Badge>
                <Text style={styles.reqQty}>Qty: {item.quantity}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="clipboard-outline" title="No requisitions" />}
        />
      </ScreenWrapper>
      <FloatingAction icon="add" onPress={() => { setForm(emptyForm); setShowForm(true); }} />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Requisition">
        <Select label="Product *" value={form.product} onValueChange={(v) => setForm(p => ({ ...p, product: v }))} options={products.map(p => ({ label: p.name, value: p._id }))} placeholder="Select product" />
        <Input label="Quantity" value={String(form.quantity)} onChangeText={(v) => setForm(p => ({ ...p, quantity: parseInt(v) || 1 }))} keyboardType="numeric" />
        <Input label="Reason" value={form.reason} onChangeText={(v) => setForm(p => ({ ...p, reason: v }))} />
        <Input label="Requested By" value={form.requestedBy} onChangeText={(v) => setForm(p => ({ ...p, requestedBy: v }))} />
        <Input label="Department" value={form.department} onChangeText={(v) => setForm(p => ({ ...p, department: v }))} />
        <Select label="Priority" value={form.priority} onValueChange={(v) => setForm(p => ({ ...p, priority: v }))} options={priorities.map(p => ({ label: p, value: p }))} />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <Button title="Cancel" variant="ghost" onPress={() => setShowForm(false)} style={{ flex: 1 }} />
          <Button title="Submit" onPress={handleSubmit} loading={saving} style={{ flex: 1 }} />
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
  reqProduct: { fontSize: 15, fontWeight: '600', color: '#111827' },
  reqDept: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  reqDate: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  reqQty: { fontSize: 15, fontWeight: '700', color: '#10B981' },
});

export default RequisitionsScreen;
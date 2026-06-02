import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getMovements, recordMovement } from '../../api/tenant/inventoryApi';
import { getProducts } from '../../api/tenant/productsApi';
import { getWarehouses } from '../../api/tenant/inventoryApi';
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

const movementTypes = ['receipt', 'issue', 'adjustment', 'return', 'production', 'consumption'];
const typeColors = { receipt: 'success', issue: 'danger', adjustment: 'warning', return: 'info', production: 'info', consumption: 'danger' };

const emptyForm = { product: '', type: 'receipt', warehouse: '', quantity: 1, unitCost: 0, notes: '' };

const MovementsScreen = ({ navigation }) => {
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [mRes, pRes, wRes] = await Promise.all([getMovements(), getProducts(), getWarehouses()]);
      setMovements(mRes.data.data || []);
      setProducts(pRes.data.data || []);
      setWarehouses(wRes.data.data || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRecord = async () => {
    if (!form.product) return setMessage('Product required');
    setSaving(true);
    try { await recordMovement(form); setShowForm(false); setForm(emptyForm); fetchData(); } catch (err) { setMessage(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <View style={styles.flex}>
      <HeaderBar title="Stock Movements" onBack={() => navigation.goBack()} />
      <ScreenWrapper scrollable={false}>
        <FlatList
          data={movements}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.mvProduct}>{item.product?.name || '—'}</Text>
                <Text style={styles.mvDate}>{formatDate(item.createdAt)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Badge variant={typeColors[item.type] || 'default'}>{item.type}</Badge>
                <Text style={[styles.mvQty, item.type === 'issue' || item.type === 'consumption' ? styles.negative : styles.positive]}>
                  {item.type === 'issue' || item.type === 'consumption' ? '-' : '+'}{item.quantity}
                </Text>
                <Text style={styles.mvWarehouse}>{item.warehouse?.name || '—'}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="swap-horizontal-outline" title="No movements" />}
        />
      </ScreenWrapper>
      <FloatingAction icon="add" onPress={() => { setForm(emptyForm); setShowForm(true); }} />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Record Movement">
        <Select label="Product *" value={form.product} onValueChange={(v) => { const p = products.find(pr => pr._id === v); setForm(prev => ({ ...prev, product: v, unitCost: p?.costPrice || 0 })); }} options={products.map(p => ({ label: p.name, value: p._id }))} placeholder="Select product" />
        <Select label="Type" value={form.type} onValueChange={(v) => setForm(p => ({ ...p, type: v }))} options={movementTypes.map(t => ({ label: t, value: t }))} />
        <Select label="Warehouse (optional)" value={form.warehouse} onValueChange={(v) => setForm(p => ({ ...p, warehouse: v }))} options={warehouses.map(w => ({ label: w.name, value: w._id }))} placeholder="Select warehouse" />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Input label="Quantity" value={String(form.quantity)} onChangeText={(v) => setForm(p => ({ ...p, quantity: parseInt(v) || 1 }))} keyboardType="numeric" style={{ flex: 1 }} />
          <Input label="Unit Cost" value={String(form.unitCost)} onChangeText={(v) => setForm(p => ({ ...p, unitCost: parseFloat(v) || 0 }))} keyboardType="numeric" style={{ flex: 1 }} />
        </View>
        <Input label="Notes" value={form.notes} onChangeText={(v) => setForm(p => ({ ...p, notes: v }))} />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <Button title="Cancel" variant="ghost" onPress={() => setShowForm(false)} style={{ flex: 1 }} />
          <Button title="Record" onPress={handleRecord} loading={saving} style={{ flex: 1 }} />
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
  mvProduct: { fontSize: 15, fontWeight: '600', color: '#111827' },
  mvDate: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  mvQty: { fontSize: 16, fontWeight: '700' },
  positive: { color: '#10B981' },
  negative: { color: '#EF4444' },
  mvWarehouse: { fontSize: 12, color: '#6B7280' },
});

export default MovementsScreen;
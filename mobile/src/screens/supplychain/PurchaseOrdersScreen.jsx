import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getPurchaseOrders, createPurchaseOrder } from '../../api/tenant/supplyChainApi';
import { getContacts } from '../../api/tenant/contactsApi';
import { getProducts } from '../../api/tenant/productsApi';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import HeaderBar from '../../components/layout/HeaderBar';
import SearchBar from '../../components/ui/SearchBar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import FloatingAction from '../../components/ui/FloatingAction';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';

const emptyForm = { supplier: '', orderDate: new Date().toISOString().split('T')[0], expectedDelivery: '', items: [], notes: '' };

const PurchaseOrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      const [oRes, cRes, pRes] = await Promise.all([getPurchaseOrders(), getContacts(), getProducts()]);
      setOrders(oRes.data.data || []);
      setSuppliers((cRes.data.data || []).filter(c => c.type === 'supplier'));
      setProducts(pRes.data.data || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const addItem = () => setForm(p => ({ ...p, items: [...p.items, { product: '', quantity: 1, unitPrice: 0 }] }));
  const updateItem = (idx, field, value) => {
    const items = [...form.items];
    if (field === 'product') { const prod = products.find(pr => pr._id === value); items[idx] = { ...items[idx], product: value, unitPrice: prod?.costPrice || 0 }; }
    else items[idx] = { ...items[idx], [field]: isNaN(value) ? value : Number(value) };
    setForm(p => ({ ...p, items }));
  };
  const removeItem = (idx) => setForm(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));

  const handleCreate = async () => {
    if (!form.supplier || !form.items.length) return setMessage('Supplier and items required');
    setSaving(true);
    try { await createPurchaseOrder(form); setShowForm(false); setForm(emptyForm); fetchOrders(); } catch (err) { setMessage(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const filtered = orders.filter(o => o.orderNumber?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <Spinner />;

  return (
    <View style={styles.flex}>
      <HeaderBar title="Purchase Orders" />
      <ScreenWrapper scrollable={false}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search POs..." />
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.poNumber}>{item.orderNumber}</Text>
                <Text style={styles.poSupplier}>{item.supplier?.companyName || 'N/A'}</Text>
                <Text style={styles.poDate}>{formatDate(item.orderDate)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Badge variant={item.status === 'delivered' ? 'success' : 'warning'}>{item.status}</Badge>
                <Text style={styles.poAmount}>{formatCurrency(item.grandTotal)}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="truck-outline" title="No purchase orders" />}
        />
      </ScreenWrapper>
      <FloatingAction icon="add" onPress={() => { setForm(emptyForm); setShowForm(true); }} />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Purchase Order">
        <Select label="Supplier *" value={form.supplier} onValueChange={(v) => setForm(p => ({ ...p, supplier: v }))} options={suppliers.map(s => ({ label: s.companyName, value: s._id }))} placeholder="Select supplier" />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Input label="Order Date" value={form.orderDate} onChangeText={(v) => setForm(p => ({ ...p, orderDate: v }))} style={{ flex: 1 }} />
          <Input label="Expected Delivery" value={form.expectedDelivery} onChangeText={(v) => setForm(p => ({ ...p, expectedDelivery: v }))} style={{ flex: 1 }} />
        </View>
        <Text style={styles.sectionLabel}>Items</Text>
        {form.items.map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Select value={item.product} onValueChange={(v) => updateItem(idx, 'product', v)} options={products.map(p => ({ label: `${p.name} (${formatCurrency(p.costPrice)})`, value: p._id }))} placeholder="Product" style={{ flex: 2 }} />
            <Input value={String(item.quantity)} onChangeText={(v) => updateItem(idx, 'quantity', v)} placeholder="Qty" keyboardType="numeric" style={{ flex: 1 }} />
            <Input value={String(item.unitPrice)} onChangeText={(v) => updateItem(idx, 'unitPrice', v)} placeholder="Price" keyboardType="numeric" style={{ flex: 1 }} />
            {form.items.length > 1 && <TouchableOpacity onPress={() => removeItem(idx)}><Text style={{ color: '#EF4444', fontSize: 18 }}>✕</Text></TouchableOpacity>}
          </View>
        ))}
        <Button title="+ Add Item" variant="ghost" size="sm" onPress={addItem} />
        <Text style={styles.total}>Total: {formatCurrency(form.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0))}</Text>
        <Input label="Notes" value={form.notes} onChangeText={(v) => setForm(p => ({ ...p, notes: v }))} />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <Button title="Cancel" variant="ghost" onPress={() => setShowForm(false)} style={{ flex: 1 }} />
          <Button title="Create PO" onPress={handleCreate} loading={saving} style={{ flex: 1 }} />
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
  poNumber: { fontSize: 15, fontWeight: '600', color: '#111827' },
  poSupplier: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  poDate: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  poAmount: { fontSize: 15, fontWeight: '700', color: '#10B981' },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 4 },
  itemRow: { flexDirection: 'row', gap: 6, marginBottom: 6, alignItems: 'center' },
  total: { textAlign: 'right', fontSize: 16, fontWeight: '700', color: '#10B981', marginTop: 8 },
});

export default PurchaseOrdersScreen;
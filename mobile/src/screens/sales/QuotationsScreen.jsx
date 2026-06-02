import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getQuotations, createQuotation, createOrder } from '../../api/tenant/salesApi';
import { getContacts } from '../../api/tenant/contactsApi';
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
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';

const emptyForm = { customer: '', customerName: '', validityDate: '', items: [] };

const QuotationsScreen = ({ navigation }) => {
  const [quotations, setQuotations] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [qRes, cRes, pRes] = await Promise.all([getQuotations(), getContacts(), getProducts()]);
      setQuotations(qRes.data.data || []);
      setContacts((cRes.data.data || []).filter(c => c.type === 'customer'));
      setProducts(pRes.data.data || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addItem = () => setForm(p => ({ ...p, items: [...p.items, { product: '', quantity: 1, unitPrice: 0 }] }));
  const updateItem = (idx, field, value) => {
    const items = [...form.items];
    if (field === 'product') {
      const prod = products.find(pr => pr._id === value);
      items[idx] = { ...items[idx], product: value, unitPrice: prod?.sellingPrice || 0 };
    } else items[idx] = { ...items[idx], [field]: isNaN(value) ? value : Number(value) };
    setForm(p => ({ ...p, items }));
  };
  const removeItem = (idx) => setForm(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));

  const handleCreate = async () => {
    if ((!form.customer && !form.customerName) || !form.items.length) return setMessage('Customer and items required');
    setSaving(true);
    try {
      const existing = contacts.find(c => c._id === form.customer);
      await createQuotation({ ...form, customer: existing ? form.customer : undefined, customerName: existing ? undefined : form.customerName });
      setShowForm(false); setForm(emptyForm); fetchData();
    } catch (err) { setMessage(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const handleConvert = async (q) => {
    try {
      await createOrder({
        customer: q.customer?._id || q.customer, customerName: q.customerName,
        orderDate: new Date().toISOString().split('T')[0],
        items: q.items.map(i => ({ product: i.product?._id || i.product, quantity: i.quantity, unitPrice: i.unitPrice, discount: 0, taxRate: 0 })),
        notes: `Converted from ${q.orderNumber}`
      });
      await require('../../api/tenant/salesApi').updateOrderStatus(q._id, 'accepted');
      fetchData();
      setMessage('Converted to Sales Order!');
    } catch { setMessage('Failed to convert'); }
  };

  if (loading) return <Spinner />;

  return (
    <View style={styles.flex}>
      <HeaderBar title="Quotations" onBack={() => navigation.goBack()} />
      <ScreenWrapper scrollable={false}>
        <FlatList
          data={quotations}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.qNumber}>{item.orderNumber}</Text>
                <Text style={styles.qCustomer}>{item.customer?.companyName || item.customerName || 'N/A'}</Text>
                <Text style={styles.qDate}>{formatDate(item.createdAt)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Badge variant={item.status === 'accepted' ? 'success' : 'info'}>{item.status}</Badge>
                <Text style={styles.qAmount}>{formatCurrency(item.grandTotal)}</Text>
                {(item.status === 'draft' || item.status === 'sent') && (
                  <Button title="→ Order" size="sm" variant="ghost" style={{ color: '#10B981' }} onPress={() => handleConvert(item)} />
                )}
              </View>
            </View>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="document-outline" title="No quotations" />}
        />
      </ScreenWrapper>
      <FloatingAction icon="add" onPress={() => { setForm(emptyForm); setShowForm(true); }} />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Quotation">
        <Select label="Customer" value={form.customer} onValueChange={(v) => setForm(p => ({ ...p, customer: v, customerName: '' }))} options={contacts.map(c => ({ label: c.companyName, value: c._id }))} placeholder="Select customer" />
        <Input label="Or New Customer" value={form.customerName} onChangeText={(v) => setForm(p => ({ ...p, customerName: v, customer: '' }))} placeholder="Type name" />
        <Input label="Valid Until" value={form.validityDate} onChangeText={(v) => setForm(p => ({ ...p, validityDate: v }))} />
        <Text style={styles.sectionLabel}>Items</Text>
        {form.items.map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Select value={item.product} onValueChange={(v) => updateItem(idx, 'product', v)} options={products.map(p => ({ label: p.name, value: p._id }))} placeholder="Product" style={{ flex: 2 }} />
            <Input value={String(item.quantity)} onChangeText={(v) => updateItem(idx, 'quantity', v)} placeholder="Qty" keyboardType="numeric" style={{ flex: 1 }} />
            <Input value={String(item.unitPrice)} onChangeText={(v) => updateItem(idx, 'unitPrice', v)} placeholder="Price" keyboardType="numeric" style={{ flex: 1 }} />
            {form.items.length > 1 && <TouchableOpacity onPress={() => removeItem(idx)}><Text style={{ color: '#EF4444', fontSize: 18 }}>✕</Text></TouchableOpacity>}
          </View>
        ))}
        <Button title="+ Add Item" variant="ghost" size="sm" onPress={addItem} />
        <Text style={styles.total}>Total: {formatCurrency(form.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0))}</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <Button title="Cancel" variant="ghost" onPress={() => setShowForm(false)} style={{ flex: 1 }} />
          <Button title="Create" onPress={handleCreate} loading={saving} style={{ flex: 1 }} />
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
  qNumber: { fontSize: 15, fontWeight: '600', color: '#111827' },
  qCustomer: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  qDate: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  qAmount: { fontSize: 15, fontWeight: '700', color: '#10B981' },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 4 },
  itemRow: { flexDirection: 'row', gap: 6, marginBottom: 6, alignItems: 'center' },
  total: { textAlign: 'right', fontSize: 16, fontWeight: '700', color: '#10B981', marginTop: 8 },
});

export default QuotationsScreen;
import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getBills, createBill, updateBillStatus } from '../../api/tenant/financeApi';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import HeaderBar from '../../components/layout/HeaderBar';
import SearchBar from '../../components/ui/SearchBar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import FloatingAction from '../../components/ui/FloatingAction';
import formatCurrency from '../../utils/formatCurrency';

const emptyForm = { supplierName: '', billDate: new Date().toISOString().split('T')[0], dueDate: '', reference: '', items: [{ description: '', quantity: 1, unitPrice: 0 }], notes: '' };

const BillsScreen = ({ navigation }) => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchBills = useCallback(async () => {
    try { const res = await getBills(); setBills(res.data.data || []); } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchBills(); }, [fetchBills]);

  const handleCreate = async () => {
    if (!form.items.length || !form.items[0].description) return setMessage('Add at least one item');
    setSaving(true);
    try { await createBill(form); setShowForm(false); setForm(emptyForm); fetchBills(); } catch (err) { setMessage(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const advanceStatus = async (id, current) => {
    const flow = ['draft', 'open', 'paid'];
    const idx = flow.indexOf(current);
    if (idx < flow.length - 1) {
      try { await updateBillStatus(id, flow[idx + 1]); fetchBills(); } catch {}
    }
  };

  const filtered = bills.filter(b => b.billNumber?.toLowerCase().includes(search.toLowerCase()) || b.supplierName?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <Spinner />;

  return (
    <View style={styles.flex}>
      <HeaderBar title="Bills" onBack={() => navigation.goBack()} />
      <ScreenWrapper scrollable={false}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search bills..." />
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => advanceStatus(item._id, item.status)} activeOpacity={0.7}>
              <View style={{ flex: 1 }}>
                <Text style={styles.billNumber}>{item.billNumber}</Text>
                <Text style={styles.billSupplier}>{item.supplierName || 'N/A'}</Text>
                <Text style={styles.billDate}>{item.billDate ? new Date(item.billDate).toLocaleDateString() : ''}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Badge variant={item.status === 'paid' ? 'success' : item.status === 'open' ? 'warning' : 'default'}>{item.status}</Badge>
                <Text style={styles.billAmount}>{formatCurrency(item.grandTotal)}</Text>
                {item.status !== 'paid' && item.status !== 'void' && (
                  <Text style={styles.nextAction}>Tap to advance</Text>
                )}
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="receipt-outline" title="No bills" />}
        />
      </ScreenWrapper>
      <FloatingAction icon="add" onPress={() => { setForm(emptyForm); setShowForm(true); }} />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Bill">
        <Input label="Supplier Name *" value={form.supplierName} onChangeText={(v) => setForm(p => ({ ...p, supplierName: v }))} placeholder="Supplier" required />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Input label="Bill Date" value={form.billDate} onChangeText={(v) => setForm(p => ({ ...p, billDate: v }))} style={{ flex: 1 }} />
          <Input label="Due Date" value={form.dueDate} onChangeText={(v) => setForm(p => ({ ...p, dueDate: v }))} style={{ flex: 1 }} />
        </View>
        <Input label="Reference" value={form.reference} onChangeText={(v) => setForm(p => ({ ...p, reference: v }))} placeholder="Optional" />
        <Text style={styles.sectionLabel}>Items</Text>
        {form.items.map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Input value={item.description} onChangeText={(v) => { const items = [...form.items]; items[idx].description = v; setForm(p => ({ ...p, items })); }} placeholder="Description" style={{ flex: 2 }} />
            <Input value={String(item.quantity)} onChangeText={(v) => { const items = [...form.items]; items[idx].quantity = parseInt(v) || 1; setForm(p => ({ ...p, items })); }} placeholder="Qty" keyboardType="numeric" style={{ flex: 1 }} />
            <Input value={String(item.unitPrice)} onChangeText={(v) => { const items = [...form.items]; items[idx].unitPrice = parseFloat(v) || 0; setForm(p => ({ ...p, items })); }} placeholder="Price" keyboardType="numeric" style={{ flex: 1 }} />
            {form.items.length > 1 && (
              <TouchableOpacity onPress={() => { setForm(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) })); }}>
                <Text style={{ color: '#EF4444', fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
        <Button title="+ Add Item" variant="ghost" size="sm" onPress={() => setForm(p => ({ ...p, items: [...p.items, { description: '', quantity: 1, unitPrice: 0 }] }))} />
        <Text style={styles.total}>
          Total: {formatCurrency(form.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0))}
        </Text>
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
  billNumber: { fontSize: 15, fontWeight: '600', color: '#111827' },
  billSupplier: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  billDate: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  billAmount: { fontSize: 15, fontWeight: '700', color: '#EF4444' },
  nextAction: { fontSize: 10, color: '#10B981', fontWeight: '500' },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 4 },
  itemRow: { flexDirection: 'row', gap: 6, marginBottom: 6, alignItems: 'center' },
  total: { textAlign: 'right', fontSize: 16, fontWeight: '700', color: '#10B981', marginTop: 8 },
});

export default BillsScreen;
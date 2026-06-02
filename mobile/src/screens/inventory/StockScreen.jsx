import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { getStockOverview, addProduct, updateProduct, deleteProduct } from '../../api/tenant/inventoryApi';
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

const types = [
  { label: 'Product', value: 'product' },
  { label: 'Service', value: 'service' },
  { label: 'Raw Material', value: 'raw_material' },
  { label: 'Finished Good', value: 'finished_good' },
];

const emptyForm = { name: '', sku: '', category: '', type: 'product', unit: 'piece', costPrice: 0, sellingPrice: 0, stock: 0, reorderLevel: 0 };

const StockScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchStock = useCallback(async () => {
    try { const res = await getStockOverview(); setProducts(res.data.data || []); } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStock(); }, [fetchStock]);

  const handleSave = async () => {
    if (!form.name) return setMessage('Product name required');
    setSaving(true);
    try {
      if (editId) await updateProduct(editId, form);
      else await addProduct(form);
      setShowForm(false); setEditId(null); setForm(emptyForm);
      fetchStock();
    } catch (err) { setMessage(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const handleEdit = (p) => { setEditId(p._id); setForm(p); setShowForm(true); };
  const handleDelete = (id) => {
    Alert.alert('Delete Product', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteProduct(id); fetchStock(); } },
    ]);
  };

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <Spinner />;

  return (
    <View style={styles.flex}>
      <HeaderBar title="Stock Overview" />
      <ScreenWrapper scrollable={false}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search products..." />
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.prodName}>{item.name}</Text>
                <Text style={styles.prodSku}>{item.sku || '—'} • {item.category || '—'}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={[styles.stockText, (item.stock || 0) <= (item.reorderLevel || 0) && styles.lowStock]}>
                  {item.stock || 0} {item.unit}
                </Text>
                <Text style={styles.priceText}>{formatCurrency(item.sellingPrice)}</Text>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  <Button title="Edit" variant="ghost" size="sm" onPress={() => handleEdit(item)} />
                  <Button title="Del" variant="ghost" size="sm" onPress={() => handleDelete(item._id)} style={{ color: '#EF4444' }} />
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="cube-outline" title="No products" />}
        />
      </ScreenWrapper>
      <FloatingAction icon="add" onPress={() => { setEditId(null); setForm(emptyForm); setShowForm(true); }} />

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? 'Edit Product' : 'Add Product'}>
        <Input label="Name *" value={form.name} onChangeText={(v) => setForm(p => ({ ...p, name: v }))} required />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Input label="SKU" value={form.sku} onChangeText={(v) => setForm(p => ({ ...p, sku: v }))} style={{ flex: 1 }} />
          <Input label="Category" value={form.category} onChangeText={(v) => setForm(p => ({ ...p, category: v }))} style={{ flex: 1 }} />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Select label="Type" value={form.type} onValueChange={(v) => setForm(p => ({ ...p, type: v }))} options={types} style={{ flex: 1 }} />
          <Input label="Unit" value={form.unit} onChangeText={(v) => setForm(p => ({ ...p, unit: v }))} style={{ flex: 1 }} />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Input label="Cost Price" value={String(form.costPrice)} onChangeText={(v) => setForm(p => ({ ...p, costPrice: parseFloat(v) || 0 }))} keyboardType="numeric" style={{ flex: 1 }} />
          <Input label="Selling Price" value={String(form.sellingPrice)} onChangeText={(v) => setForm(p => ({ ...p, sellingPrice: parseFloat(v) || 0 }))} keyboardType="numeric" style={{ flex: 1 }} />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Input label="Stock Qty" value={String(form.stock)} onChangeText={(v) => setForm(p => ({ ...p, stock: parseInt(v) || 0 }))} keyboardType="numeric" style={{ flex: 1 }} />
          <Input label="Reorder Level" value={String(form.reorderLevel)} onChangeText={(v) => setForm(p => ({ ...p, reorderLevel: parseInt(v) || 0 }))} keyboardType="numeric" style={{ flex: 1 }} />
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <Button title="Cancel" variant="ghost" onPress={() => setShowForm(false)} style={{ flex: 1 }} />
          <Button title="Save" onPress={handleSave} loading={saving} style={{ flex: 1 }} />
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
  prodName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  prodSku: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  stockText: { fontSize: 16, fontWeight: '700', color: '#10B981' },
  lowStock: { color: '#EF4444' },
  priceText: { fontSize: 13, color: '#6B7280' },
});

export default StockScreen;
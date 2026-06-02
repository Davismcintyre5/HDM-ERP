import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../../api/tenant/productsApi';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import HeaderBar from '../../components/layout/HeaderBar';
import SearchBar from '../../components/ui/SearchBar';
import Card from '../../components/ui/Card';
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
const emptyForm = { name: '', sku: '', category: '', type: 'product', unit: 'piece', costPrice: 0, sellingPrice: 0, reorderLevel: 0 };

const ProductsScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchProducts = useCallback(async () => {
    try { const res = await getProducts(); setProducts(res.data.data || []); } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSave = async () => {
    if (!form.name) return setMessage('Product name required');
    setSaving(true);
    try {
      if (editId) await updateProduct(editId, form);
      else await createProduct(form);
      setShowForm(false); setEditId(null); setForm(emptyForm); fetchProducts();
    } catch (err) { setMessage(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const handleEdit = (p) => { setEditId(p._id); setForm(p); setShowForm(true); };
  const handleDelete = (id) => {
    Alert.alert('Delete Product', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteProduct(id); fetchProducts(); } },
    ]);
  };

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <Spinner />;

  return (
    <View style={styles.flex}>
      <HeaderBar title="Products" />
      <ScreenWrapper scrollable={false}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search products..." />
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.prodName}>{item.name}</Text>
                  <Text style={styles.prodSku}>{item.sku || '—'} • {item.category || '—'}</Text>
                </View>
                <Badge variant="info">{item.type}</Badge>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.costText}>Cost: {formatCurrency(item.costPrice)}</Text>
                <Text style={styles.sellText}>Sell: {formatCurrency(item.sellingPrice)}</Text>
              </View>
              <View style={styles.actions}>
                <Button title="Edit" variant="ghost" size="sm" onPress={() => handleEdit(item)} />
                <Button title="Delete" variant="ghost" size="sm" onPress={() => handleDelete(item._id)} style={{ color: '#EF4444' }} />
              </View>
            </Card>
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
        <Select label="Type" value={form.type} onValueChange={(v) => setForm(p => ({ ...p, type: v }))} options={types} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Input label="Cost Price" value={String(form.costPrice)} onChangeText={(v) => setForm(p => ({ ...p, costPrice: parseFloat(v) || 0 }))} keyboardType="numeric" style={{ flex: 1 }} />
          <Input label="Selling Price" value={String(form.sellingPrice)} onChangeText={(v) => setForm(p => ({ ...p, sellingPrice: parseFloat(v) || 0 }))} keyboardType="numeric" style={{ flex: 1 }} />
        </View>
        <Input label="Reorder Level" value={String(form.reorderLevel)} onChangeText={(v) => setForm(p => ({ ...p, reorderLevel: parseInt(v) || 0 }))} keyboardType="numeric" />
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
  card: { marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 6 },
  prodName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  prodSku: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  priceRow: { flexDirection: 'row', gap: 16, marginTop: 4, marginBottom: 4 },
  costText: { fontSize: 13, color: '#6B7280' },
  sellText: { fontSize: 13, color: '#10B981', fontWeight: '600' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
});

export default ProductsScreen;
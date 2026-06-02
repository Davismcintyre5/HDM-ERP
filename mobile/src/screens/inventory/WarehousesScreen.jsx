import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { getWarehouses, addWarehouse } from '../../api/tenant/inventoryApi';
import { getProducts } from '../../api/tenant/productsApi';
import api from '../../api/axios';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import HeaderBar from '../../components/layout/HeaderBar';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import FloatingAction from '../../components/ui/FloatingAction';
import { Ionicons } from '@expo/vector-icons';

const emptyForm = { code: '', name: '', address: '' };

const WarehousesScreen = ({ navigation }) => {
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [viewWH, setViewWH] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [wRes, pRes] = await Promise.all([getWarehouses(), getProducts()]);
      setWarehouses(wRes.data.data || []);
      setProducts(pRes.data.data || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      if (editId) await api.put(`/tenant/inventory/warehouses/${editId}`, form);
      else await addWarehouse(form);
      setShowForm(false); setEditId(null); setForm(emptyForm);
      fetchData();
    } catch (err) { setMessage(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const handleEdit = (w) => { setEditId(w._id); setForm(w); setShowForm(true); };
  const handleDelete = (id) => {
    Alert.alert('Delete Warehouse', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await api.delete(`/tenant/inventory/warehouses/${id}`); fetchData(); } },
    ]);
  };

  if (loading) return <Spinner />;

  return (
    <View style={styles.flex}>
      <HeaderBar title="Warehouses" onBack={() => navigation.goBack()} />
      <ScreenWrapper scrollable={false}>
        <FlatList
          data={warehouses}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setViewWH(item)} activeOpacity={0.7}>
              <Card style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="business-outline" size={24} color="#10B981" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.whName}>{item.name}</Text>
                    {item.code && <Text style={styles.whCode}>{item.code}</Text>}
                  </View>
                  <Badge variant="info">{products.filter(p => p.stock > 0).length} items</Badge>
                </View>
                {item.address && <Text style={styles.whAddress}>📍 {item.address}</Text>}
                <View style={styles.actions}>
                  <Button title="Edit" variant="ghost" size="sm" onPress={() => handleEdit(item)} />
                  <Button title="Delete" variant="ghost" size="sm" onPress={() => handleDelete(item._id)} style={{ color: '#EF4444' }} />
                </View>
              </Card>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="business-outline" title="No warehouses" />}
        />
      </ScreenWrapper>
      <FloatingAction icon="add" onPress={() => { setEditId(null); setForm(emptyForm); setShowForm(true); }} />

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? 'Edit Warehouse' : 'Add Warehouse'}>
        <Input label="Code" value={form.code} onChangeText={(v) => setForm(p => ({ ...p, code: v }))} />
        <Input label="Name *" value={form.name} onChangeText={(v) => setForm(p => ({ ...p, name: v }))} required />
        <Input label="Address" value={form.address} onChangeText={(v) => setForm(p => ({ ...p, address: v }))} />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <Button title="Cancel" variant="ghost" onPress={() => setShowForm(false)} style={{ flex: 1 }} />
          <Button title="Save" onPress={handleSave} loading={saving} style={{ flex: 1 }} />
        </View>
      </Modal>

      {/* View Warehouse */}
      <Modal open={!!viewWH} onClose={() => setViewWH(null)} title={viewWH?.name || 'Warehouse'}>
        {viewWH && (
          <View>
            <Text style={styles.viewCode}>Code: {viewWH.code || '—'}</Text>
            {viewWH.address && <Text style={styles.viewAddress}>{viewWH.address}</Text>}
            <Text style={styles.viewLabel}>Products</Text>
            {products.filter(p => p.stock > 0).length === 0 ? (
              <Text style={styles.viewEmpty}>No products in stock</Text>
            ) : (
              products.filter(p => p.stock > 0).slice(0, 10).map(p => (
                <View key={p._id} style={styles.productRow}>
                  <Text style={styles.productName}>{p.name}</Text>
                  <Badge variant="info">{p.stock} {p.unit}</Badge>
                </View>
              ))
            )}
            <Button title="Close" variant="ghost" onPress={() => setViewWH(null)} style={{ marginTop: 16 }} />
          </View>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F9FAFB' },
  list: { padding: 16, paddingTop: 8 },
  card: { marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  whName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  whCode: { fontSize: 12, fontFamily: 'monospace', color: '#6B7280', marginTop: 2 },
  whAddress: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
  viewCode: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  viewAddress: { fontSize: 14, color: '#6B7280', marginBottom: 16 },
  viewLabel: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 8 },
  viewEmpty: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingVertical: 20 },
  productRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  productName: { fontSize: 14, color: '#111827' },
});

export default WarehousesScreen;
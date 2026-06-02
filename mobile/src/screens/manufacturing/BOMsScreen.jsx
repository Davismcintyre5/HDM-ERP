import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getBOMs, createBOM } from '../../api/tenant/manufacturingApi';
import { getProducts } from '../../api/tenant/productsApi';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import HeaderBar from '../../components/layout/HeaderBar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import FloatingAction from '../../components/ui/FloatingAction';
import { Ionicons } from '@expo/vector-icons';

const emptyForm = { product: '', components: [{ product: '', quantity: 1, unit: 'piece' }] };

const BOMsScreen = ({ navigation }) => {
  const [boms, setBoms] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [bRes, pRes] = await Promise.all([getBOMs(), getProducts()]);
      setBoms(bRes.data.data || []);
      setProducts(pRes.data.data || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addComponent = () => setForm(p => ({ ...p, components: [...p.components, { product: '', quantity: 1, unit: 'piece' }] }));
  const updateComponent = (idx, field, value) => {
    const comps = [...form.components];
    comps[idx] = { ...comps[idx], [field]: isNaN(value) ? value : Number(value) };
    setForm(p => ({ ...p, components: comps }));
  };
  const removeComponent = (idx) => setForm(p => ({ ...p, components: p.components.filter((_, i) => i !== idx) }));

  const handleCreate = async () => {
    if (!form.product || !form.components.length) return setMessage('Product and components required');
    setSaving(true);
    try { await createBOM(form); setShowForm(false); setForm(emptyForm); fetchData(); } catch (err) { setMessage(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <View style={styles.flex}>
      <HeaderBar title="Bill of Materials" />
      <ScreenWrapper scrollable={false}>
        <FlatList
          data={boms}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="layers-outline" size={20} color="#10B981" />
                <Text style={styles.bomProduct}>{item.product?.name || 'N/A'}</Text>
              </View>
              {item.components?.map((c, i) => (
                <Text key={i} style={styles.component}>• {c.product?.name || 'Component'} — {c.quantity} {c.unit}</Text>
              ))}
            </Card>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="layers-outline" title="No BOMs" />}
        />
      </ScreenWrapper>
      <FloatingAction icon="add" onPress={() => { setForm(emptyForm); setShowForm(true); }} />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New BOM">
        <Select label="Finished Product *" value={form.product} onValueChange={(v) => setForm(p => ({ ...p, product: v }))} options={products.map(p => ({ label: p.name, value: p._id }))} placeholder="Select product" />
        <Text style={styles.sectionLabel}>Components</Text>
        {form.components.map((c, idx) => (
          <View key={idx} style={styles.compRow}>
            <Select value={c.product} onValueChange={(v) => updateComponent(idx, 'product', v)} options={products.filter(p => p._id !== form.product).map(p => ({ label: p.name, value: p._id }))} placeholder="Component" style={{ flex: 2 }} />
            <Input value={String(c.quantity)} onChangeText={(v) => updateComponent(idx, 'quantity', v)} placeholder="Qty" keyboardType="numeric" style={{ flex: 1 }} />
            <Input value={c.unit} onChangeText={(v) => updateComponent(idx, 'unit', v)} placeholder="Unit" style={{ flex: 1 }} />
            {form.components.length > 1 && <TouchableOpacity onPress={() => removeComponent(idx)}><Text style={{ color: '#EF4444', fontSize: 18 }}>✕</Text></TouchableOpacity>}
          </View>
        ))}
        <Button title="+ Add Component" variant="ghost" size="sm" onPress={addComponent} />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <Button title="Cancel" variant="ghost" onPress={() => setShowForm(false)} style={{ flex: 1 }} />
          <Button title="Create BOM" onPress={handleCreate} loading={saving} style={{ flex: 1 }} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F9FAFB' },
  list: { padding: 16, paddingTop: 8 },
  card: { marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  bomProduct: { fontSize: 16, fontWeight: '600', color: '#111827' },
  component: { fontSize: 13, color: '#6B7280', marginLeft: 28, marginTop: 2 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 4 },
  compRow: { flexDirection: 'row', gap: 6, marginBottom: 6, alignItems: 'center' },
});

export default BOMsScreen;
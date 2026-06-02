import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { transferStock, getWarehouses } from '../../api/tenant/inventoryApi';
import { getProducts } from '../../api/tenant/productsApi';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import HeaderBar from '../../components/layout/HeaderBar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Alert from '../../components/ui/Alert';
import { Ionicons } from '@expo/vector-icons';

const TransfersScreen = ({ navigation }) => {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState({ product: '', fromWarehouse: '', toWarehouse: '', quantity: 1 });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getProducts().then(res => setProducts(res.data.data || []));
    getWarehouses().then(res => setWarehouses(res.data.data || []));
  }, []);

  const handleTransfer = async () => {
    if (!form.product || !form.fromWarehouse || !form.toWarehouse) return setMessage('All fields required');
    if (form.fromWarehouse === form.toWarehouse) return setMessage('Select different warehouses');
    setSaving(true);
    try {
      await transferStock(form);
      setMessage('');
      Alert.alert('Success', 'Stock transferred successfully');
      setForm({ product: '', fromWarehouse: '', toWarehouse: '', quantity: 1 });
    } catch (err) { setMessage(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  return (
    <View style={styles.flex}>
      <HeaderBar title="Stock Transfer" onBack={() => navigation.goBack()} />
      <ScreenWrapper>
        <Card style={styles.card}>
          <Ionicons name="swap-horizontal" size={28} color="#10B981" style={{ alignSelf: 'center', marginBottom: 16 }} />
          {message ? <Alert variant="error" message={message} onClose={() => setMessage('')} /> : null}
          <Select label="Product *" value={form.product} onValueChange={(v) => setForm(p => ({ ...p, product: v }))} options={products.map(p => ({ label: p.name, value: p._id }))} placeholder="Select product" />
          <Select label="From Warehouse *" value={form.fromWarehouse} onValueChange={(v) => setForm(p => ({ ...p, fromWarehouse: v }))} options={warehouses.map(w => ({ label: w.name, value: w._id }))} placeholder="Source" />
          <Select label="To Warehouse *" value={form.toWarehouse} onValueChange={(v) => setForm(p => ({ ...p, toWarehouse: v }))} options={warehouses.map(w => ({ label: w.name, value: w._id }))} placeholder="Destination" />
          <Input label="Quantity" value={String(form.quantity)} onChangeText={(v) => setForm(p => ({ ...p, quantity: parseInt(v) || 1 }))} keyboardType="numeric" />
          <Button title="Transfer Stock" onPress={handleTransfer} loading={saving} style={{ marginTop: 20 }} />
        </Card>
      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F9FAFB' },
  card: { margin: 16, padding: 20 },
});

export default TransfersScreen;
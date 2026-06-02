import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getPurchaseOrders, receiveGoods } from '../../api/tenant/supplyChainApi';
import { getWarehouses } from '../../api/tenant/inventoryApi';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import HeaderBar from '../../components/layout/HeaderBar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Alert from '../../components/ui/Alert';
import formatCurrency from '../../utils/formatCurrency';

const ReceivingScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedPO, setSelectedPO] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [quantities, setQuantities] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getPurchaseOrders().then(res => setOrders((res.data.data || []).filter(o => o.status !== 'delivered' && o.status !== 'cancelled')));
    getWarehouses().then(res => setWarehouses(res.data.data || []));
  }, []);

  const po = orders.find(o => o._id === selectedPO);

  const handleReceive = async () => {
    if (!selectedPO || !warehouse) return setMessage('Select PO and warehouse');
    setSaving(true);
    try {
      await receiveGoods({ purchaseOrderId: selectedPO, warehouse, quantities });
      setMessage(''); Alert.alert('Success', 'Goods received! Stock updated.');
      setSelectedPO(''); setWarehouse(''); setQuantities({});
      getPurchaseOrders().then(res => setOrders((res.data.data || []).filter(o => o.status !== 'delivered')));
    } catch (err) { setMessage(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  return (
    <View style={styles.flex}>
      <HeaderBar title="Goods Receiving" onBack={() => navigation.goBack()} />
      <ScreenWrapper>
        <Card style={styles.card}>
          {message ? <Alert variant="error" message={message} onClose={() => setMessage('')} /> : null}
          <Select label="Purchase Order *" value={selectedPO} onValueChange={(v) => { setSelectedPO(v); setQuantities({}); }} options={orders.map(o => ({ label: `${o.orderNumber} — ${o.supplier?.companyName || 'N/A'}`, value: o._id }))} placeholder="Select PO" />
          {po && (
            <>
              <Select label="Warehouse *" value={warehouse} onValueChange={setWarehouse} options={warehouses.map(w => ({ label: w.name, value: w._id }))} placeholder="Select warehouse" />
              <Text style={styles.sectionLabel}>Received Quantities</Text>
              {po.items?.map((item, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <Text style={styles.itemName}>{item.product?.name || `Item ${idx + 1}`}</Text>
                  <Text style={styles.itemOrdered}>Ordered: {item.quantity}</Text>
                  <Input value={String(quantities[idx] || '')} onChangeText={(v) => setQuantities(p => ({ ...p, [idx]: parseInt(v) || 0 }))} placeholder="0" keyboardType="numeric" style={{ width: 60 }} />
                </View>
              ))}
              <Button title="Receive Goods" onPress={handleReceive} loading={saving} style={{ marginTop: 16 }} />
            </>
          )}
        </Card>
      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F9FAFB' },
  card: { margin: 16, padding: 20 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#111827', marginTop: 12, marginBottom: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  itemName: { flex: 1, fontSize: 14, color: '#111827' },
  itemOrdered: { fontSize: 12, color: '#6B7280' },
});

export default ReceivingScreen;
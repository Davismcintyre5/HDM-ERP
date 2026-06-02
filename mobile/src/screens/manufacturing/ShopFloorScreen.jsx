import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getWorkOrders, logProduction } from '../../api/tenant/manufacturingApi';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import HeaderBar from '../../components/layout/HeaderBar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Alert from '../../components/ui/Alert';

const ShopFloorScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [selectedWO, setSelectedWO] = useState('');
  const [outputQty, setOutputQty] = useState(0);
  const [scrapQty, setScrapQty] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getWorkOrders().then(res => setOrders((res.data.data || []).filter(o => o.status !== 'completed' && o.status !== 'cancelled')));
  }, []);

  const handleLog = async () => {
    if (!selectedWO) return;
    setSaving(true);
    try {
      await logProduction({ workOrderId: selectedWO, outputQty, scrapQty });
      setMessage(''); Alert.alert('Success', 'Production logged');
      setSelectedWO(''); setOutputQty(0); setScrapQty(0);
      getWorkOrders().then(res => setOrders((res.data.data || []).filter(o => o.status !== 'completed')));
    } catch (err) { setMessage(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  return (
    <View style={styles.flex}>
      <HeaderBar title="Shop Floor" onBack={() => navigation.goBack()} />
      <ScreenWrapper>
        <Card style={styles.card}>
          <Text style={styles.emoji}>🔨</Text>
          {message ? <Alert variant="error" message={message} onClose={() => setMessage('')} /> : null}
          <Select label="Work Order" value={selectedWO} onValueChange={setSelectedWO} options={orders.map(o => ({ label: `${o.orderNumber} — ${o.product?.name || 'N/A'} (Qty: ${o.quantity})`, value: o._id }))} placeholder="Select WO" />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Input label="Output Qty" value={String(outputQty)} onChangeText={(v) => setOutputQty(parseInt(v) || 0)} keyboardType="numeric" style={{ flex: 1 }} />
            <Input label="Scrap Qty" value={String(scrapQty)} onChangeText={(v) => setScrapQty(parseInt(v) || 0)} keyboardType="numeric" style={{ flex: 1 }} />
          </View>
          <Button title="Log Production" onPress={handleLog} loading={saving} style={{ marginTop: 12 }} />
        </Card>
      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F9FAFB' },
  card: { margin: 16, padding: 20 },
  emoji: { fontSize: 40, textAlign: 'center', marginBottom: 12 },
});

export default ShopFloorScreen;
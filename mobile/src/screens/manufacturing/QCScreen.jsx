import { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getWorkOrders, recordQC } from '../../api/tenant/manufacturingApi';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import HeaderBar from '../../components/layout/HeaderBar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Alert from '../../components/ui/Alert';

const QCScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [selectedWO, setSelectedWO] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getWorkOrders().then(res => setOrders((res.data.data || []).filter(o => o.status === 'processing' || o.status === 'completed')));
  }, []);

  const handleQC = async (pass) => {
    if (!selectedWO) return;
    setSaving(true);
    try {
      await recordQC({ workOrderId: selectedWO, pass, notes });
      setMessage(''); Alert.alert(pass ? 'Passed ✓' : 'Failed — rework needed');
      setSelectedWO(''); setNotes('');
      getWorkOrders().then(res => setOrders((res.data.data || []).filter(o => o.status === 'processing' || o.status === 'completed')));
    } catch (err) { setMessage(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  return (
    <View style={styles.flex}>
      <HeaderBar title="Quality Control" onBack={() => navigation.goBack()} />
      <ScreenWrapper>
        <Card style={styles.card}>
          {message ? <Alert variant="error" message={message} onClose={() => setMessage('')} /> : null}
          <Select label="Work Order" value={selectedWO} onValueChange={setSelectedWO} options={orders.map(o => ({ label: `${o.orderNumber} — ${o.product?.name || 'N/A'}`, value: o._id }))} placeholder="Select WO" />
          <Input label="Inspection Notes" value={notes} onChangeText={setNotes} placeholder="Notes..." />
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <Button title="✅ Pass" onPress={() => handleQC(true)} loading={saving} style={{ flex: 1, backgroundColor: '#10B981' }} />
            <Button title="❌ Fail" onPress={() => handleQC(false)} loading={saving} style={{ flex: 1, backgroundColor: '#EF4444' }} />
          </View>
        </Card>
      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F9FAFB' },
  card: { margin: 16, padding: 20 },
});

export default QCScreen;
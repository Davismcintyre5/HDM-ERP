import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { recordRevenue, recordExpense } from '../../api/tenant/financeApi';
import { getAccounts } from '../../api/tenant/financeApi';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import HeaderBar from '../../components/layout/HeaderBar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import AlertMsg from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';

const RevenueExpensesScreen = ({ navigation }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('revenue');
  const [form, setForm] = useState({ account: '', payerPayee: '', amount: 0, paymentMethod: 'cash', date: new Date().toISOString().split('T')[0], notes: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { getAccounts().then(res => setAccounts(res.data.data || [])).finally(() => setLoading(false)); }, []);

  const handleSubmit = async () => {
    if (!form.account || !form.amount) return setMessage('Account and amount required');
    setSaving(true);
    try {
      if (type === 'revenue') await recordRevenue(form);
      else await recordExpense(form);
      setMessage(''); Alert.alert('Success', `${type === 'revenue' ? 'Revenue' : 'Expense'} recorded`);
      setForm(p => ({ ...p, amount: 0, payerPayee: '', notes: '' }));
    } catch (err) { setMessage(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const filteredAccounts = accounts.filter(a => type === 'revenue' ? a.type === 'income' : a.type === 'expense');

  if (loading) return <Spinner />;

  return (
    <View style={styles.flex}>
      <HeaderBar title={type === 'revenue' ? 'Record Revenue' : 'Record Expense'} onBack={() => navigation.goBack()} />
      <ScreenWrapper>
        <Card style={styles.card}>
          {message ? <AlertMsg variant="error" message={message} onClose={() => setMessage('')} /> : null}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
            <Button title="Revenue" variant={type === 'revenue' ? 'primary' : 'ghost'} onPress={() => setType('revenue')} style={{ flex: 1 }} />
            <Button title="Expense" variant={type === 'expense' ? 'danger' : 'ghost'} onPress={() => setType('expense')} style={{ flex: 1 }} />
          </View>
          <Select label="Account *" value={form.account} onValueChange={(v) => setForm(p => ({ ...p, account: v }))} options={filteredAccounts.map(a => ({ label: `${a.code} - ${a.name}`, value: a._id }))} placeholder="Select account" />
          <Input label={type === 'revenue' ? 'Payer' : 'Payee'} value={form.payerPayee} onChangeText={(v) => setForm(p => ({ ...p, payerPayee: v }))} />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Input label="Amount *" value={String(form.amount)} onChangeText={(v) => setForm(p => ({ ...p, amount: parseFloat(v) || 0 }))} keyboardType="numeric" style={{ flex: 1 }} />
            <Select label="Method" value={form.paymentMethod} onValueChange={(v) => setForm(p => ({ ...p, paymentMethod: v }))} options={['cash', 'bank', 'mpesa'].map(m => ({ label: m, value: m }))} style={{ flex: 1 }} />
          </View>
          <Input label="Date" value={form.date} onChangeText={(v) => setForm(p => ({ ...p, date: v }))} />
          <Input label="Notes" value={form.notes} onChangeText={(v) => setForm(p => ({ ...p, notes: v }))} />
          <Button title={`Record ${type === 'revenue' ? 'Revenue' : 'Expense'}`} onPress={handleSubmit} loading={saving} style={{ marginTop: 12 }} />
        </Card>
      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F9FAFB' },
  card: { margin: 16, padding: 20 },
});

export default RevenueExpensesScreen;
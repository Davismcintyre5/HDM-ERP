import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getAccounts, createAccount, updateAccount, deleteAccount } from '../../api/tenant/financeApi';
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
  { label: 'Asset', value: 'asset' },
  { label: 'Liability', value: 'liability' },
  { label: 'Equity', value: 'equity' },
  { label: 'Income', value: 'income' },
  { label: 'Expense', value: 'expense' },
  { label: 'Cost of Sales', value: 'cost_of_sales' },
];
const typeColors = { asset: 'info', liability: 'warning', equity: 'success', income: 'success', expense: 'danger', cost_of_sales: 'danger' };

const emptyForm = { code: '', name: '', type: 'asset', description: '', openingBalance: 0 };

const AccountsScreen = ({ navigation }) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchAccounts = useCallback(async () => {
    try { const res = await getAccounts(); setAccounts(res.data.data || []); } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleSave = async () => {
    if (!form.code || !form.name) return setMessage('Code and Name are required');
    setSaving(true);
    try {
      if (editId) await updateAccount(editId, form);
      else await createAccount(form);
      setShowForm(false); setEditId(null); setForm(emptyForm);
      fetchAccounts();
    } catch (err) { setMessage(err.response?.data?.message || 'Failed to save'); } finally { setSaving(false); }
  };

  const handleEdit = (acc) => { setEditId(acc._id); setForm(acc); setShowForm(true); };

  const handleDelete = (id) => {
    Alert.alert('Delete Account', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteAccount(id); fetchAccounts(); } },
    ]);
  };

  const filtered = accounts.filter(a => a.name?.toLowerCase().includes(search.toLowerCase()) || a.code?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <Spinner />;

  return (
    <View style={styles.flex}>
      <HeaderBar title="Chart of Accounts" />
      <ScreenWrapper scrollable={false}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search accounts..." />
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.code}>{item.code}</Text>
                <Badge variant={typeColors[item.type] || 'default'}>{item.type}</Badge>
              </View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={[styles.balance, item.currentBalance >= 0 ? styles.positive : styles.negative]}>
                {formatCurrency(item.currentBalance || 0)}
              </Text>
              <View style={styles.actions}>
                <Button title="Edit" variant="ghost" size="sm" onPress={() => handleEdit(item)} />
                <Button title="Delete" variant="ghost" size="sm" onPress={() => handleDelete(item._id)} style={{ color: '#EF4444' }} />
              </View>
            </Card>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="wallet-outline" title="No accounts yet" />}
        />
      </ScreenWrapper>
      <FloatingAction icon="add" onPress={() => { setEditId(null); setForm(emptyForm); setShowForm(true); }} />

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? 'Edit Account' : 'Add Account'}>
        <Input label="Code *" value={form.code} onChangeText={(v) => setForm(p => ({ ...p, code: v }))} placeholder="e.g. 1001" required />
        <Input label="Name *" value={form.name} onChangeText={(v) => setForm(p => ({ ...p, name: v }))} placeholder="Account name" required />
        <Select label="Type" value={form.type} onValueChange={(v) => setForm(p => ({ ...p, type: v }))} options={types} />
        <Input label="Description" value={form.description} onChangeText={(v) => setForm(p => ({ ...p, description: v }))} placeholder="Optional" />
        <Input label="Opening Balance" value={String(form.openingBalance)} onChangeText={(v) => setForm(p => ({ ...p, openingBalance: parseFloat(v) || 0 }))} keyboardType="numeric" />
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
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  code: { fontSize: 13, fontFamily: 'monospace', color: '#6B7280', fontWeight: '600' },
  name: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  balance: { fontSize: 18, fontWeight: '700' },
  positive: { color: '#10B981' },
  negative: { color: '#EF4444' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, gap: 8 },
});

export default AccountsScreen;
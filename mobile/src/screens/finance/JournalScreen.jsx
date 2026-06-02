import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getJournals, createJournal } from '../../api/tenant/financeApi';
import { getAccounts } from '../../api/tenant/financeApi';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import HeaderBar from '../../components/layout/HeaderBar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import FloatingAction from '../../components/ui/FloatingAction';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';

const emptyForm = { date: new Date().toISOString().split('T')[0], description: '', reference: '', lines: [{ account: '', description: '', debit: 0, credit: 0 }] };

const JournalScreen = ({ navigation }) => {
  const [entries, setEntries] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [jRes, aRes] = await Promise.all([getJournals(), getAccounts()]);
      setEntries(jRes.data.data || []);
      setAccounts(aRes.data.data || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addLine = () => setForm(p => ({ ...p, lines: [...p.lines, { account: '', description: '', debit: 0, credit: 0 }] }));
  const updateLine = (idx, field, value) => {
    const lines = [...form.lines];
    lines[idx] = { ...lines[idx], [field]: isNaN(value) ? value : Number(value) };
    setForm(p => ({ ...p, lines }));
  };
  const removeLine = (idx) => setForm(p => ({ ...p, lines: p.lines.filter((_, i) => i !== idx) }));

  const totalDebit = form.lines.reduce((s, l) => s + (l.debit || 0), 0);
  const totalCredit = form.lines.reduce((s, l) => s + (l.credit || 0), 0);
  const balanced = Math.abs(totalDebit - totalCredit) < 0.001;

  const handleCreate = async () => {
    if (!balanced) return setMessage('Debits must equal credits');
    setSaving(true);
    try { await createJournal(form); setShowForm(false); setForm(emptyForm); fetchData(); } catch (err) { setMessage(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <View style={styles.flex}>
      <HeaderBar title="Journal Entries" onBack={() => navigation.goBack()} />
      <ScreenWrapper scrollable={false}>
        <FlatList
          data={entries}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.jeDesc}>{item.description}</Text>
                <Text style={styles.jeRef}>{item.reference || ''} • {formatDate(item.date)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={styles.jeDebit}>Dr {formatCurrency(item.totalDebit)}</Text>
                <Text style={styles.jeCredit}>Cr {formatCurrency(item.totalCredit)}</Text>
                <Badge variant="success">{item.status}</Badge>
              </View>
            </View>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="book-outline" title="No journal entries" />}
        />
      </ScreenWrapper>
      <FloatingAction icon="add" onPress={() => { setForm(emptyForm); setShowForm(true); }} />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Journal Entry">
        <Input label="Date" value={form.date} onChangeText={(v) => setForm(p => ({ ...p, date: v }))} />
        <Input label="Description" value={form.description} onChangeText={(v) => setForm(p => ({ ...p, description: v }))} />
        <Input label="Reference" value={form.reference} onChangeText={(v) => setForm(p => ({ ...p, reference: v }))} />
        <Text style={styles.sectionLabel}>Lines</Text>
        {form.lines.map((line, idx) => (
          <View key={idx} style={styles.lineRow}>
            <Select value={line.account} onValueChange={(v) => updateLine(idx, 'account', v)} options={accounts.map(a => ({ label: `${a.code} - ${a.name}`, value: a._id }))} placeholder="Account" style={{ flex: 2 }} />
            <Input value={String(line.debit)} onChangeText={(v) => updateLine(idx, 'debit', v)} placeholder="Debit" keyboardType="numeric" style={{ flex: 1 }} />
            <Input value={String(line.credit)} onChangeText={(v) => updateLine(idx, 'credit', v)} placeholder="Credit" keyboardType="numeric" style={{ flex: 1 }} />
            {form.lines.length > 1 && <TouchableOpacity onPress={() => removeLine(idx)}><Text style={{ color: '#EF4444', fontSize: 18 }}>✕</Text></TouchableOpacity>}
          </View>
        ))}
        <Button title="+ Add Line" variant="ghost" size="sm" onPress={addLine} />
        <Text style={[styles.balanceText, balanced ? styles.balanced : styles.unbalanced]}>
          Dr {formatCurrency(totalDebit)} | Cr {formatCurrency(totalCredit)} | {balanced ? '✓ Balanced' : '⚠ Unbalanced'}
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <Button title="Cancel" variant="ghost" onPress={() => setShowForm(false)} style={{ flex: 1 }} />
          <Button title="Post Entry" onPress={handleCreate} loading={saving} disabled={!balanced} style={{ flex: 1 }} />
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
  jeDesc: { fontSize: 14, fontWeight: '600', color: '#111827' },
  jeRef: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  jeDebit: { fontSize: 13, color: '#EF4444', fontWeight: '500' },
  jeCredit: { fontSize: 13, color: '#10B981', fontWeight: '500' },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 4 },
  lineRow: { flexDirection: 'row', gap: 4, marginBottom: 6, alignItems: 'center' },
  balanceText: { textAlign: 'right', fontSize: 13, fontWeight: '600', marginTop: 8 },
  balanced: { color: '#10B981' },
  unbalanced: { color: '#EF4444' },
});

export default JournalScreen;
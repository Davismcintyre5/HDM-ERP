import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getPayrollHistory, runPayroll } from '../../api/tenant/hrApi';
import { getEmployees } from '../../api/tenant/hrApi';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import HeaderBar from '../../components/layout/HeaderBar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import FloatingAction from '../../components/ui/FloatingAction';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';

const PayrollScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRun, setShowRun] = useState(false);
  const [form, setForm] = useState({ periodStart: '', periodEnd: '', paymentDate: '', items: [] });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [pRes, eRes] = await Promise.all([getPayrollHistory(), getEmployees()]);
      setHistory(pRes.data.data || []);
      setEmployees(eRes.data.data || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const initRun = () => {
    setForm({
      periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      periodEnd: new Date().toISOString().split('T')[0],
      paymentDate: new Date().toISOString().split('T')[0],
      items: employees.map(e => ({
        employee: e._id, basicPay: e.basicSalary || 0,
        allowances: [], deductions: [], grossPay: e.basicSalary || 0, netPay: e.basicSalary || 0
      }))
    });
    setShowRun(true);
  };

  const handleRun = async () => {
    setSaving(true);
    try { await runPayroll(form); setShowRun(false); fetchData(); } catch (err) { setMessage(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <View style={styles.flex}>
      <HeaderBar title="Payroll" onBack={() => navigation.goBack()} />
      <ScreenWrapper scrollable={false}>
        <FlatList
          data={history}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowPeriod}>{formatDate(item.periodStart)} – {formatDate(item.periodEnd)}</Text>
                <Text style={styles.rowCount}>{item.items?.length || 0} employees</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={styles.rowNet}>{formatCurrency(item.totalNet)}</Text>
                <Badge variant="success">{item.status}</Badge>
              </View>
            </View>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="cash-outline" title="No payroll runs" />}
        />
      </ScreenWrapper>
      <FloatingAction icon="add" onPress={initRun} />

      <Modal open={showRun} onClose={() => setShowRun(false)} title="Run Payroll">
        <Input label="Period Start" value={form.periodStart} onChangeText={(v) => setForm(p => ({ ...p, periodStart: v }))} />
        <Input label="Period End" value={form.periodEnd} onChangeText={(v) => setForm(p => ({ ...p, periodEnd: v }))} />
        <Input label="Payment Date" value={form.paymentDate} onChangeText={(v) => setForm(p => ({ ...p, paymentDate: v }))} />
        <Text style={{ fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 8 }}>
          Total Gross: {formatCurrency(form.items.reduce((s, i) => s + (i.grossPay || 0), 0))}
        </Text>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#10B981', marginBottom: 16 }}>
          Total Net: {formatCurrency(form.items.reduce((s, i) => s + (i.netPay || 0), 0))}
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button title="Cancel" variant="ghost" onPress={() => setShowRun(false)} style={{ flex: 1 }} />
          <Button title="Run Payroll" onPress={handleRun} loading={saving} style={{ flex: 1 }} />
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
  rowPeriod: { fontSize: 14, fontWeight: '600', color: '#111827' },
  rowCount: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  rowNet: { fontSize: 16, fontWeight: '700', color: '#10B981' },
});

export default PayrollScreen;
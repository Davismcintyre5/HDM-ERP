import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getLeave, requestLeave, updateLeaveStatus } from '../../api/tenant/hrApi';
import { getEmployees } from '../../api/tenant/hrApi';
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
import formatDate from '../../utils/formatDate';

const leaveTypes = ['annual', 'sick', 'maternity', 'paternity', 'unpaid', 'other'];
const emptyForm = { employee: '', type: 'annual', startDate: '', endDate: '', reason: '' };

const LeaveScreen = ({ navigation }) => {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [lRes, eRes] = await Promise.all([getLeave(), getEmployees()]);
      setLeaves(lRes.data.data || []);
      setEmployees(eRes.data.data || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRequest = async () => {
    if (!form.employee || !form.startDate || !form.endDate) return setMessage('Employee and dates required');
    setSaving(true);
    try { await requestLeave(form); setShowForm(false); setForm(emptyForm); fetchData(); } catch (err) { setMessage(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const handleStatus = async (id, status) => {
    try { await updateLeaveStatus(id, status); fetchData(); } catch {}
  };

  if (loading) return <Spinner />;

  return (
    <View style={styles.flex}>
      <HeaderBar title="Leave Management" onBack={() => navigation.goBack()} />
      <ScreenWrapper scrollable={false}>
        <FlatList
          data={leaves}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowName}>{item.employee?.firstName} {item.employee?.lastName}</Text>
                <Text style={styles.rowType}>{item.type} • {item.days} days</Text>
                <Text style={styles.rowDate}>{formatDate(item.startDate)} → {formatDate(item.endDate)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <Badge variant={item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'danger' : 'warning'}>{item.status}</Badge>
                {item.status === 'pending' && (
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    <Button title="Approve" size="sm" variant="ghost" style={{ color: '#10B981' }} onPress={() => handleStatus(item._id, 'approved')} />
                    <Button title="Reject" size="sm" variant="ghost" style={{ color: '#EF4444' }} onPress={() => handleStatus(item._id, 'rejected')} />
                  </View>
                )}
              </View>
            </View>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="calendar-outline" title="No leave requests" />}
        />
      </ScreenWrapper>
      <FloatingAction icon="add" onPress={() => { setForm(emptyForm); setShowForm(true); }} />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Request Leave">
        <Select
          label="Employee *"
          value={form.employee}
          onValueChange={(v) => setForm(p => ({ ...p, employee: v }))}
          options={employees.map(e => ({ label: `${e.firstName} ${e.lastName}`, value: e._id }))}
          placeholder="Select employee"
        />
        <Select label="Type" value={form.type} onValueChange={(v) => setForm(p => ({ ...p, type: v }))} options={leaveTypes.map(t => ({ label: t, value: t }))} />
        <Input label="Start Date *" value={form.startDate} onChangeText={(v) => setForm(p => ({ ...p, startDate: v }))} placeholder="YYYY-MM-DD" />
        <Input label="End Date *" value={form.endDate} onChangeText={(v) => setForm(p => ({ ...p, endDate: v }))} placeholder="YYYY-MM-DD" />
        <Input label="Reason" value={form.reason} onChangeText={(v) => setForm(p => ({ ...p, reason: v }))} placeholder="Optional" />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <Button title="Cancel" variant="ghost" onPress={() => setShowForm(false)} style={{ flex: 1 }} />
          <Button title="Submit" onPress={handleRequest} loading={saving} style={{ flex: 1 }} />
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
  rowName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  rowType: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  rowDate: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
});

export default LeaveScreen;
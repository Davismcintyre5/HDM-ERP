import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getAttendance, markAttendance } from '../../api/tenant/hrApi';
import { getEmployees } from '../../api/tenant/hrApi';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import HeaderBar from '../../components/layout/HeaderBar';
import SearchBar from '../../components/ui/SearchBar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import FloatingAction from '../../components/ui/FloatingAction';
import formatDate from '../../utils/formatDate';

const emptyForm = { employee: '', date: new Date().toISOString().split('T')[0], checkIn: '', checkOut: '', status: 'present' };

const AttendanceScreen = ({ navigation }) => {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [aRes, eRes] = await Promise.all([getAttendance(), getEmployees()]);
      setRecords(aRes.data.data || []);
      setEmployees(eRes.data.data || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleMark = async () => {
    if (!form.employee) return setMessage('Select an employee');
    setSaving(true);
    try { await markAttendance(form); setShowForm(false); setForm(emptyForm); fetchData(); } catch (err) { setMessage(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const filtered = records.filter(r => {
    const name = `${r.employee?.firstName || ''} ${r.employee?.lastName || ''}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  if (loading) return <Spinner />;

  return (
    <View style={styles.flex}>
      <HeaderBar title="Attendance" onBack={() => navigation.goBack()} />
      <ScreenWrapper scrollable={false}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search..." />
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowName}>{item.employee?.firstName} {item.employee?.lastName}</Text>
                <Text style={styles.rowDate}>{formatDate(item.date)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={styles.rowTime}>{item.checkIn || '—'} — {item.checkOut || '—'}</Text>
                <Badge variant={item.status === 'present' ? 'success' : item.status === 'late' ? 'warning' : 'danger'}>{item.status}</Badge>
              </View>
            </View>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="time-outline" title="No attendance records" />}
        />
      </ScreenWrapper>
      <FloatingAction icon="add" onPress={() => { setForm(emptyForm); setShowForm(true); }} />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Mark Attendance">
        <Select
          label="Employee *"
          value={form.employee}
          onValueChange={(v) => setForm(p => ({ ...p, employee: v }))}
          options={employees.map(e => ({ label: `${e.firstName} ${e.lastName}`, value: e._id }))}
          placeholder="Select employee"
        />
        <Input label="Date" value={form.date} onChangeText={(v) => setForm(p => ({ ...p, date: v }))} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Input label="Check In" value={form.checkIn} onChangeText={(v) => setForm(p => ({ ...p, checkIn: v }))} placeholder="HH:MM" style={{ flex: 1 }} />
          <Input label="Check Out" value={form.checkOut} onChangeText={(v) => setForm(p => ({ ...p, checkOut: v }))} placeholder="HH:MM" style={{ flex: 1 }} />
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <Button title="Cancel" variant="ghost" onPress={() => setShowForm(false)} style={{ flex: 1 }} />
          <Button title="Save" onPress={handleMark} loading={saving} style={{ flex: 1 }} />
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
  rowDate: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  rowTime: { fontSize: 13, color: '#6B7280' },
});

export default AttendanceScreen;
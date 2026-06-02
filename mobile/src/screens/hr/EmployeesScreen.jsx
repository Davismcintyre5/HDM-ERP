import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from '../../api/tenant/hrApi';
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
  { label: 'Full Time', value: 'full_time' },
  { label: 'Part Time', value: 'part_time' },
  { label: 'Contract', value: 'contract' },
  { label: 'Intern', value: 'intern' },
];

const emptyForm = { firstName: '', lastName: '', email: '', phone: '', department: '', position: '', employmentType: 'full_time', hireDate: '', basicSalary: 0 };

const EmployeesScreen = ({ navigation }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [viewEmp, setViewEmp] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchEmployees = useCallback(async () => {
    try { const res = await getEmployees(); setEmployees(res.data.data || []); } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.email) return setMessage('Name and email required');
    setSaving(true);
    try {
      if (editId) await updateEmployee(editId, form);
      else await addEmployee(form);
      setShowForm(false); setEditId(null); setForm(emptyForm);
      fetchEmployees();
    } catch (err) { setMessage(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const handleEdit = (emp) => { setEditId(emp._id); setForm(emp); setShowForm(true); };
  const handleDelete = (id) => {
    Alert.alert('Delete Employee', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteEmployee(id); fetchEmployees(); } },
    ]);
  };

  const filtered = employees.filter(e =>
    `${e.firstName} ${e.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase()) ||
    e.department?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner />;

  return (
    <View style={styles.flex}>
      <HeaderBar title="Employees" />
      <ScreenWrapper scrollable={false}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search employees..." />
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setViewEmp(item)} activeOpacity={0.7}>
              <Card style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatarSmall}>
                    <Text style={styles.avatarText}>{item.firstName?.[0]}{item.lastName?.[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.empName}>{item.firstName} {item.lastName}</Text>
                    <Text style={styles.empDept}>{item.position || item.department || 'N/A'}</Text>
                  </View>
                  <Badge variant="info">{item.employmentType}</Badge>
                </View>
                <View style={styles.actions}>
                  <Button title="Edit" variant="ghost" size="sm" onPress={() => handleEdit(item)} />
                  <Button title="Delete" variant="ghost" size="sm" onPress={() => handleDelete(item._id)} style={{ color: '#EF4444' }} />
                </View>
              </Card>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="people-outline" title="No employees" />}
        />
      </ScreenWrapper>
      <FloatingAction icon="add" onPress={() => { setEditId(null); setForm(emptyForm); setShowForm(true); }} />

      {/* Add/Edit Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? 'Edit Employee' : 'Add Employee'}>
        <Input label="First Name *" value={form.firstName} onChangeText={(v) => setForm(p => ({ ...p, firstName: v }))} required />
        <Input label="Last Name *" value={form.lastName} onChangeText={(v) => setForm(p => ({ ...p, lastName: v }))} required />
        <Input label="Email *" value={form.email} onChangeText={(v) => setForm(p => ({ ...p, email: v }))} keyboardType="email-address" required />
        <Input label="Phone" value={form.phone} onChangeText={(v) => setForm(p => ({ ...p, phone: v }))} keyboardType="phone-pad" />
        <Input label="Department" value={form.department} onChangeText={(v) => setForm(p => ({ ...p, department: v }))} />
        <Input label="Position" value={form.position} onChangeText={(v) => setForm(p => ({ ...p, position: v }))} />
        <Select label="Type" value={form.employmentType} onValueChange={(v) => setForm(p => ({ ...p, employmentType: v }))} options={types} />
        <Input label="Hire Date" value={form.hireDate} onChangeText={(v) => setForm(p => ({ ...p, hireDate: v }))} placeholder="YYYY-MM-DD" />
        <Input label="Basic Salary" value={String(form.basicSalary)} onChangeText={(v) => setForm(p => ({ ...p, basicSalary: parseFloat(v) || 0 }))} keyboardType="numeric" />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <Button title="Cancel" variant="ghost" onPress={() => setShowForm(false)} style={{ flex: 1 }} />
          <Button title="Save" onPress={handleSave} loading={saving} style={{ flex: 1 }} />
        </View>
      </Modal>

      {/* View Modal */}
      <Modal open={!!viewEmp} onClose={() => setViewEmp(null)} title="Employee Details">
        {viewEmp && (
          <View style={{ alignItems: 'center' }}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarLargeText}>{viewEmp.firstName?.[0]}{viewEmp.lastName?.[0]}</Text>
            </View>
            <Text style={styles.viewName}>{viewEmp.firstName} {viewEmp.lastName}</Text>
            <Text style={styles.viewRole}>{viewEmp.position} • {viewEmp.department}</Text>
            <View style={styles.detailGrid}>
              <View style={styles.detailItem}><Text style={styles.detailLabel}>Email</Text><Text style={styles.detailValue}>{viewEmp.email}</Text></View>
              <View style={styles.detailItem}><Text style={styles.detailLabel}>Phone</Text><Text style={styles.detailValue}>{viewEmp.phone || 'N/A'}</Text></View>
              <View style={styles.detailItem}><Text style={styles.detailLabel}>Type</Text><Badge variant="info">{viewEmp.employmentType}</Badge></View>
              <View style={styles.detailItem}><Text style={styles.detailLabel}>Hire Date</Text><Text style={styles.detailValue}>{viewEmp.hireDate || 'N/A'}</Text></View>
              <View style={styles.detailItem}><Text style={styles.detailLabel}>Salary</Text><Text style={[styles.detailValue, { color: '#10B981', fontWeight: '700' }]}>{formatCurrency(viewEmp.basicSalary)}</Text></View>
            </View>
            <Button title="Close" variant="ghost" onPress={() => setViewEmp(null)} style={{ marginTop: 16 }} />
          </View>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F9FAFB' },
  list: { padding: 16, paddingTop: 8 },
  card: { marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  avatarSmall: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  empName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  empDept: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
  avatarLarge: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarLargeText: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },
  viewName: { fontSize: 20, fontWeight: '700', color: '#111827' },
  viewRole: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  detailGrid: { width: '100%', marginTop: 20, gap: 12 },
  detailItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  detailLabel: { fontSize: 14, color: '#6B7280' },
  detailValue: { fontSize: 14, color: '#111827', fontWeight: '500' },
});

export default EmployeesScreen;
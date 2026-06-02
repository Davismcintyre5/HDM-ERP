import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { getContacts, createContact, updateContact, deleteContact } from '../../api/tenant/contactsApi';
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

const types = [
  { label: 'Customer', value: 'customer' },
  { label: 'Supplier', value: 'supplier' },
  { label: 'Partner', value: 'partner' },
];
const typeColors = { customer: 'info', supplier: 'warning', partner: 'success' };

const emptyForm = { type: 'customer', companyName: '', contactPerson: '', email: '', phone: '' };

const ContactsScreen = ({ navigation }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchContacts = useCallback(async () => {
    try { const res = await getContacts(); setContacts(res.data.data || []); } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const handleSave = async () => {
    if (!form.companyName) return setMessage('Company name required');
    setSaving(true);
    try {
      if (editId) await updateContact(editId, form);
      else await createContact(form);
      setShowForm(false); setEditId(null); setForm(emptyForm); fetchContacts();
    } catch (err) { setMessage(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const handleEdit = (c) => { setEditId(c._id); setForm(c); setShowForm(true); };
  const handleDelete = (id) => {
    Alert.alert('Delete Contact', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteContact(id); fetchContacts(); } },
    ]);
  };

  const filtered = contacts.filter(c => {
    const matchSearch = !search || c.companyName?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || c.type === filterType;
    return matchSearch && matchType;
  });

  if (loading) return <Spinner />;

  return (
    <View style={styles.flex}>
      <HeaderBar title="Contacts" />
      <ScreenWrapper scrollable={false}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search contacts..." />
        <View style={styles.filterRow}>
          {[{ label: 'All', value: 'all' }, ...types].map(t => (
            <TouchableOpacity key={t.value} onPress={() => setFilterType(t.value)} style={[styles.filterBtn, filterType === t.value && styles.filterActive]}>
              <Text style={[styles.filterText, filterType === t.value && styles.filterTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactName}>{item.companyName || 'N/A'}</Text>
                  {item.contactPerson && <Text style={styles.contactPerson}>{item.contactPerson}</Text>}
                </View>
                <Badge variant={typeColors[item.type] || 'default'}>{item.type}</Badge>
              </View>
              {item.email && <Text style={styles.contactDetail}>📧 {item.email}</Text>}
              {item.phone && <Text style={styles.contactDetail}>📞 {item.phone}</Text>}
              <View style={styles.actions}>
                <Button title="Edit" variant="ghost" size="sm" onPress={() => handleEdit(item)} />
                <Button title="Delete" variant="ghost" size="sm" onPress={() => handleDelete(item._id)} style={{ color: '#EF4444' }} />
              </View>
            </Card>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="people-outline" title="No contacts" />}
        />
      </ScreenWrapper>
      <FloatingAction icon="add" onPress={() => { setEditId(null); setForm(emptyForm); setShowForm(true); }} />

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? 'Edit Contact' : 'Add Contact'}>
        <Select label="Type" value={form.type} onValueChange={(v) => setForm(p => ({ ...p, type: v }))} options={types} />
        <Input label="Company Name *" value={form.companyName} onChangeText={(v) => setForm(p => ({ ...p, companyName: v }))} required />
        <Input label="Contact Person" value={form.contactPerson} onChangeText={(v) => setForm(p => ({ ...p, contactPerson: v }))} />
        <Input label="Email" value={form.email} onChangeText={(v) => setForm(p => ({ ...p, email: v }))} keyboardType="email-address" />
        <Input label="Phone" value={form.phone} onChangeText={(v) => setForm(p => ({ ...p, phone: v }))} keyboardType="phone-pad" />
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
  filterRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 16, marginBottom: 8 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: '#F3F4F6' },
  filterActive: { backgroundColor: '#10B981' },
  filterText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  filterTextActive: { color: '#FFFFFF' },
  card: { marginBottom: 10, marginHorizontal: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 6 },
  contactName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  contactPerson: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  contactDetail: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
});

export default ContactsScreen;
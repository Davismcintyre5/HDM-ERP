import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import { getContacts, createContact, updateContact, deleteContact } from '../../api/tenant/contactsApi';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import HeaderBar from '../../components/layout/HeaderBar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import FloatingAction from '../../components/ui/FloatingAction';
import { Ionicons } from '@expo/vector-icons';

const emptyForm = { companyName: '', contactPerson: '', email: '', phone: '' };

const SuppliersScreen = ({ navigation }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchSuppliers = useCallback(async () => {
    try { const res = await getContacts(); setSuppliers((res.data.data || []).filter(c => c.type === 'supplier')); } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const handleSave = async () => {
    if (!form.companyName) return setMessage('Company name required');
    setSaving(true);
    try {
      if (editId) await updateContact(editId, { ...form, type: 'supplier' });
      else await createContact({ ...form, type: 'supplier' });
      setShowForm(false); setEditId(null); setForm(emptyForm); fetchSuppliers();
    } catch (err) { setMessage(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const handleEdit = (s) => { setEditId(s._id); setForm(s); setShowForm(true); };
  const handleDelete = (id) => {
    Alert.alert('Delete Supplier', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteContact(id); fetchSuppliers(); } },
    ]);
  };

  if (loading) return <Spinner />;

  return (
    <View style={styles.flex}>
      <HeaderBar title="Suppliers" onBack={() => navigation.goBack()} />
      <ScreenWrapper scrollable={false}>
        <FlatList
          data={suppliers}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="business" size={22} color="#10B981" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.supName}>{item.companyName}</Text>
                  {item.contactPerson && <Text style={styles.supContact}>{item.contactPerson}</Text>}
                </View>
              </View>
              {item.email && <Text style={styles.supDetail}>📧 {item.email}</Text>}
              {item.phone && <Text style={styles.supDetail}>📞 {item.phone}</Text>}
              <View style={styles.actions}>
                <Button title="Edit" variant="ghost" size="sm" onPress={() => handleEdit(item)} />
                <Button title="Delete" variant="ghost" size="sm" onPress={() => handleDelete(item._id)} style={{ color: '#EF4444' }} />
              </View>
            </Card>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="business-outline" title="No suppliers" />}
        />
      </ScreenWrapper>
      <FloatingAction icon="add" onPress={() => { setEditId(null); setForm(emptyForm); setShowForm(true); }} />

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? 'Edit Supplier' : 'Add Supplier'}>
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
  card: { marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  supName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  supContact: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  supDetail: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
});

export default SuppliersScreen;
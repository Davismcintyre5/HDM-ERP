import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getReports, saveReport, runReport, deleteReport } from '../../api/tenant/reportsApi';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import HeaderBar from '../../components/layout/HeaderBar';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import FloatingAction from '../../components/ui/FloatingAction';
import { Ionicons } from '@expo/vector-icons';

const modules = ['finance', 'hr', 'sales', 'inventory', 'supply_chain', 'manufacturing', 'all'];
const reportTypes = ['tabular', 'chart', 'summary'];

const emptyForm = { name: '', module: 'finance', type: 'tabular', description: '' };

const ReportsScreen = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchReports = useCallback(async () => {
    try { const res = await getReports(); setReports(res.data.data || []); } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    try { await saveReport(form); setShowForm(false); setForm(emptyForm); fetchReports(); } catch (err) { setMessage(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const handleRun = async (id) => {
    try { const res = await runReport(id); setViewData(res.data.data); } catch {}
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Report', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteReport(id); fetchReports(); } },
    ]);
  };

  if (loading) return <Spinner />;

  return (
    <View style={styles.flex}>
      <HeaderBar title="Reports" />
      <ScreenWrapper scrollable={false}>
        <FlatList
          data={reports}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="document-text-outline" size={20} color="#10B981" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.reportName}>{item.name}</Text>
                  <Text style={styles.reportMeta}>{item.module} • {item.type}</Text>
                </View>
              </View>
              <View style={styles.actions}>
                <Button title="Run" variant="ghost" size="sm" onPress={() => handleRun(item._id)} />
                <Button title="Delete" variant="ghost" size="sm" onPress={() => handleDelete(item._id)} style={{ color: '#EF4444' }} />
              </View>
            </Card>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="document-text-outline" title="No reports" />}
        />
      </ScreenWrapper>
      <FloatingAction icon="add" onPress={() => { setForm(emptyForm); setShowForm(true); }} />

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Report">
        <Input label="Name *" value={form.name} onChangeText={(v) => setForm(p => ({ ...p, name: v }))} required />
        <Select label="Module" value={form.module} onValueChange={(v) => setForm(p => ({ ...p, module: v }))} options={modules.map(m => ({ label: m, value: m }))} />
        <Select label="Type" value={form.type} onValueChange={(v) => setForm(p => ({ ...p, type: v }))} options={reportTypes.map(t => ({ label: t, value: t }))} />
        <Input label="Description" value={form.description} onChangeText={(v) => setForm(p => ({ ...p, description: v }))} />
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <Button title="Cancel" variant="ghost" onPress={() => setShowForm(false)} style={{ flex: 1 }} />
          <Button title="Save" onPress={handleSave} loading={saving} style={{ flex: 1 }} />
        </View>
      </Modal>

      <Modal open={!!viewData} onClose={() => setViewData(null)} title="Report Results">
        <View style={{ maxHeight: 400 }}>
          <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#374151' }}>{JSON.stringify(viewData, null, 2)}</Text>
        </View>
        <Button title="Close" variant="ghost" onPress={() => setViewData(null)} style={{ marginTop: 12 }} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F9FAFB' },
  list: { padding: 16, paddingTop: 8 },
  card: { marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  reportName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  reportMeta: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
});

export default ReportsScreen;
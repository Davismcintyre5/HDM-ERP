import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getJobs, postJob } from '../../api/tenant/hrApi';
import api from '../../api/axios';
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
import formatDate from '../../utils/formatDate';

const types = [
  { label: 'Full Time', value: 'full_time' },
  { label: 'Part Time', value: 'part_time' },
  { label: 'Contract', value: 'contract' },
  { label: 'Intern', value: 'intern' },
];
const appMethods = [
  { label: 'Email', value: 'email' },
  { label: 'Online Portal', value: 'online' },
  { label: 'Hand Delivery', value: 'hand_delivery' },
  { label: 'Email & Hand', value: 'both' },
];

const emptyForm = {
  title: '', department: '', type: 'full_time', location: '', salary: '',
  description: '', duties: '', qualifications: '', requirements: '',
  applicationMethod: '', applicationLink: '', startDate: '', endDate: ''
};

const RecruitmentScreen = ({ navigation }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [viewJob, setViewJob] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchJobs = useCallback(async () => {
    try { const res = await getJobs(); setJobs(res.data.data || []); } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleSave = async () => {
    if (!form.title || !form.department) return setMessage('Title and department required');
    setSaving(true);
    try {
      if (editId) await api.put(`/tenant/hr/recruitment/${editId}`, form);
      else await postJob(form);
      setShowForm(false); setEditId(null); setForm(emptyForm);
      fetchJobs();
    } catch (err) { setMessage(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const handleClose = async (id) => {
    try { await api.put(`/tenant/hr/recruitment/${id}/close`); fetchJobs(); } catch {}
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Job', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await api.delete(`/tenant/hr/recruitment/${id}`); fetchJobs(); } },
    ]);
  };

  const filtered = jobs.filter(j =>
    j.title?.toLowerCase().includes(search.toLowerCase()) ||
    j.department?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner />;

  return (
    <View style={styles.flex}>
      <HeaderBar title="Recruitment" onBack={() => navigation.goBack()} />
      <ScreenWrapper scrollable={false}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search jobs..." />
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setViewJob(item)} activeOpacity={0.7}>
              <Card style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.jobTitle}>{item.title}</Text>
                    <Text style={styles.jobDept}>{item.department} • {item.type}</Text>
                  </View>
                  <Badge variant={item.status === 'open' ? 'success' : 'danger'}>{item.status}</Badge>
                </View>
                {item.location && <Text style={styles.jobLocation}>📍 {item.location}</Text>}
                {item.salary && <Text style={styles.jobSalary}>💰 {item.salary}</Text>}
                <View style={styles.actions}>
                  <Button title="Edit" variant="ghost" size="sm" onPress={() => { setEditId(item._id); setForm(item); setShowForm(true); }} />
                  <Button title="Close" variant="ghost" size="sm" onPress={() => handleClose(item._id)} style={{ color: '#F59E0B' }} />
                  <Button title="Delete" variant="ghost" size="sm" onPress={() => handleDelete(item._id)} style={{ color: '#EF4444' }} />
                </View>
              </Card>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState icon="briefcase-outline" title="No job openings" />}
        />
      </ScreenWrapper>
      <FloatingAction icon="add" onPress={() => { setEditId(null); setForm(emptyForm); setShowForm(true); }} />

      {/* Add/Edit Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? 'Edit Job' : 'Post Job'}>
        <Input label="Job Title *" value={form.title} onChangeText={(v) => setForm(p => ({ ...p, title: v }))} required />
        <Input label="Department *" value={form.department} onChangeText={(v) => setForm(p => ({ ...p, department: v }))} required />
        <Select label="Type" value={form.type} onValueChange={(v) => setForm(p => ({ ...p, type: v }))} options={types} />
        <Input label="Location" value={form.location} onChangeText={(v) => setForm(p => ({ ...p, location: v }))} />
        <Input label="Salary" value={form.salary} onChangeText={(v) => setForm(p => ({ ...p, salary: v }))} />
        <Input label="Description" value={form.description} onChangeText={(v) => setForm(p => ({ ...p, description: v }))} multiline numberOfLines={3} />
        <Input label="Duties" value={form.duties} onChangeText={(v) => setForm(p => ({ ...p, duties: v }))} multiline numberOfLines={3} />
        <Input label="Qualifications" value={form.qualifications} onChangeText={(v) => setForm(p => ({ ...p, qualifications: v }))} multiline numberOfLines={2} />
        <Input label="Requirements" value={form.requirements} onChangeText={(v) => setForm(p => ({ ...p, requirements: v }))} multiline numberOfLines={2} />
        <Select label="How to Apply" value={form.applicationMethod} onValueChange={(v) => setForm(p => ({ ...p, applicationMethod: v }))} options={appMethods} />
        <Input label="Application Link/Email" value={form.applicationLink} onChangeText={(v) => setForm(p => ({ ...p, applicationLink: v }))} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Input label="Start Date" value={form.startDate} onChangeText={(v) => setForm(p => ({ ...p, startDate: v }))} style={{ flex: 1 }} />
          <Input label="End Date" value={form.endDate} onChangeText={(v) => setForm(p => ({ ...p, endDate: v }))} style={{ flex: 1 }} />
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <Button title="Cancel" variant="ghost" onPress={() => setShowForm(false)} style={{ flex: 1 }} />
          <Button title="Save" onPress={handleSave} loading={saving} style={{ flex: 1 }} />
        </View>
      </Modal>

      {/* View Modal */}
      <Modal open={!!viewJob} onClose={() => setViewJob(null)} title={viewJob?.title || 'Job Details'}>
        {viewJob && (
          <View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              <Badge variant="info">{viewJob.department}</Badge>
              <Badge>{viewJob.type}</Badge>
              {viewJob.location && <Badge variant="warning">{viewJob.location}</Badge>}
            </View>
            {viewJob.salary && <Text style={styles.viewSalary}>{viewJob.salary}</Text>}
            {viewJob.description && <><Text style={styles.viewLabel}>Description</Text><Text style={styles.viewText}>{viewJob.description}</Text></>}
            {viewJob.duties && <><Text style={styles.viewLabel}>Duties</Text><Text style={styles.viewText}>{viewJob.duties}</Text></>}
            {viewJob.qualifications && <><Text style={styles.viewLabel}>Qualifications</Text><Text style={styles.viewText}>{viewJob.qualifications}</Text></>}
            {viewJob.applicationMethod && (
              <View style={styles.applyBox}>
                <Text style={styles.applyTitle}>How to Apply</Text>
                <Text style={styles.applyText}>{viewJob.applicationMethod.replace('_', ' ')}</Text>
                {viewJob.applicationLink && <Text style={styles.applyLink}>{viewJob.applicationLink}</Text>}
              </View>
            )}
            <Text style={styles.viewDate}>{formatDate(viewJob.startDate)} – {formatDate(viewJob.endDate)}</Text>
            <Button title="Close" variant="ghost" onPress={() => setViewJob(null)} style={{ marginTop: 16 }} />
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
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  jobTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
  jobDept: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  jobLocation: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  jobSalary: { fontSize: 14, color: '#10B981', fontWeight: '500', marginTop: 2 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 6, marginTop: 8 },
  viewSalary: { fontSize: 18, fontWeight: '700', color: '#10B981', marginBottom: 16 },
  viewLabel: { fontSize: 14, fontWeight: '600', color: '#111827', marginTop: 12, marginBottom: 4 },
  viewText: { fontSize: 14, color: '#374151', lineHeight: 20 },
  viewDate: { fontSize: 12, color: '#9CA3AF', marginTop: 16, textAlign: 'center' },
  applyBox: { backgroundColor: '#D1FAE5', borderRadius: 10, padding: 14, marginTop: 16 },
  applyTitle: { fontSize: 14, fontWeight: '600', color: '#065F46', marginBottom: 4 },
  applyText: { fontSize: 14, color: '#065F46', textTransform: 'capitalize' },
  applyLink: { fontSize: 13, color: '#10B981', marginTop: 4, fontWeight: '500' },
});

export default RecruitmentScreen;
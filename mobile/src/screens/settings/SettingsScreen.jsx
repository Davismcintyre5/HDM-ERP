import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useTenant } from '../../hooks/useTenant';
import { getCompany, updateCompany, getModules } from '../../api/tenant/companyApi';
import { getAISettings, updateAISettings, generateOutwardKey, getOutwardKeys, revokeOutwardKey } from '../../api/tenant/aiApi';
import { getUsers, inviteUser, deleteUser } from '../../api/tenant/usersApi';
import { getBilling } from '../../api/tenant/billingApi';
import { changePassword, getTrustedDevices, removeTrustedDevice } from '../../api/tenant/securityApi';
import { getBackupSettings, updateBackupSettings, getBackupHistory } from '../../api/tenant/backupApi';
import api from '../../api/axios';
import ScreenWrapper from '../../components/layout/ScreenWrapper';
import HeaderBar from '../../components/layout/HeaderBar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Toggle from '../../components/ui/Toggle';
import Spinner from '../../components/ui/Spinner';
import { Ionicons } from '@expo/vector-icons';

const tabs = [
  { key: 'profile', label: 'Profile', icon: 'person-outline' },
  { key: 'company', label: 'Company', icon: 'business-outline' },
  { key: 'users', label: 'Users', icon: 'people-outline' },
  { key: 'modules', label: 'Modules', icon: 'apps-outline' },
  { key: 'ai', label: 'AI', icon: 'hardware-chip-outline' },
  { key: 'keys', label: 'API Keys', icon: 'key-outline' },
  { key: 'billing', label: 'Billing', icon: 'card-outline' },
  { key: 'security', label: 'Security', icon: 'shield-outline' },
  { key: 'backups', label: 'Backups', icon: 'cloud-upload-outline' },
];

const roles = [
  { label: 'Company Admin', value: 'company_admin' },
  { label: 'Accountant', value: 'accountant' },
  { label: 'HR Manager', value: 'hr_manager' },
  { label: 'Sales Manager', value: 'sales_manager' },
  { label: 'Inventory Manager', value: 'inventory_manager' },
  { label: 'Staff', value: 'staff' },
];

const moduleList = [
  { key: 'finance', label: 'Finance' },
  { key: 'hr', label: 'HR' },
  { key: 'sales', label: 'Sales' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'supplyChain', label: 'Supply Chain' },
  { key: 'orders', label: 'Orders' },
  { key: 'manufacturing', label: 'Manufacturing' },
  { key: 'contacts', label: 'Contacts' },
  { key: 'products', label: 'Products' },
  { key: 'reports', label: 'Reports' },
  { key: 'settings', label: 'Settings' },
  { key: 'dashboard', label: 'Dashboard' },
];

const scopeList = ['finance', 'hr', 'sales', 'inventory', 'supplyChain', 'manufacturing', 'contacts', 'products', 'reports'];

const SettingsScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { tenant, plan } = useTenant();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const [company, setCompany] = useState({});
  const [users, setUsers] = useState([]);
  const [tenantModules, setTenantModules] = useState({});
  const [planModules, setPlanModules] = useState({});
  const [aiSettings, setAiSettings] = useState({ keySource: 'hdm', moduleScopes: [] });
  const [apiKeys, setApiKeys] = useState([]);
  const [billing, setBilling] = useState({});
  const [devices, setDevices] = useState([]);
  const [backupSettings, setBackupSettings] = useState({});
  const [backupHistory, setBackupHistory] = useState([]);

  const [showUserForm, setShowUserForm] = useState(false);
  const [showKeyForm, setShowKeyForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [createdKey, setCreatedKey] = useState(null);
  const [userForm, setUserForm] = useState({ email: '', firstName: '', lastName: '', password: '', role: 'staff' });
  const [keyForm, setKeyForm] = useState({ name: '', scopes: [] });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });

  useEffect(() => { loadAllData(); }, []);

 const loadAllData = async () => {
    try {
      const [cRes, uRes, mRes, aRes, kRes, bRes, dRes, bsRes, bhRes] = await Promise.all([
        getCompany().catch(() => ({ data: { data: {} } })),
        getUsers().catch(() => ({ data: { data: [] } })),
        getModules().catch(() => ({ data: { data: { modules: {}, planModules: {} } } })),
        getAISettings().catch(() => ({ data: { data: { keySource: 'hdm', moduleScopes: [] } } })),
        getOutwardKeys().catch(() => ({ data: { data: [] } })),
        getBilling().catch(() => ({ data: { data: {} } })),
        getTrustedDevices().catch(() => ({ data: { data: [] } })),
        getBackupSettings().catch(() => ({ data: { data: {} } })),
        getBackupHistory().catch(() => ({ data: { data: [] } })),
      ]);

      setCompany(cRes.data.data || {});
      setUsers(uRes.data.data || []);
      setTenantModules(mRes.data.data?.modules || {});
      setPlanModules(mRes.data.data?.planModules || {});
      setAiSettings(aRes.data.data || { keySource: 'hdm', moduleScopes: [] });
      setApiKeys(kRes.data.data || []);
      setBilling(bRes.data.data || {});
      setDevices(dRes.data.data || []);
      setBackupSettings(bsRes.data.data || {});
      setBackupHistory(bhRes.data.data || []);
    } catch (err) {
      console.log('Settings load error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const handleSaveCompany = async () => {
    setSaving(true);
    try { await updateCompany(company); showMsg('Company saved'); } catch { showMsg('Failed'); } finally { setSaving(false); }
  };

  const handleInviteUser = async () => {
    if (!userForm.email || !userForm.firstName) return showMsg('Fill all fields');
    setSaving(true);
    try {
      await inviteUser(userForm);
      setShowUserForm(false);
      setUserForm({ email: '', firstName: '', lastName: '', password: '', role: 'staff' });
      loadAllData();
      showMsg('User invited');
    } catch (err) { showMsg(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const handleDeleteUser = (id) => {
    Alert.alert('Delete User', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteUser(id); loadAllData(); showMsg('User deleted'); } },
    ]);
  };

  const isModuleEnabled = (key) => {
    if (tenantModules[key] === undefined) return planModules[key] !== false;
    return tenantModules[key] !== false;
  };

  const handleToggleModule = async (key) => {
    if (!planModules[key]) return;
    const newValue = !isModuleEnabled(key);
    const updated = { ...tenantModules, [key]: newValue };
    setTenantModules(updated);
    try { await api.put('/tenant/company/modules/toggle', { modules: updated }); } catch { setTenantModules(tenantModules); }
  };

  const handleSaveAI = async () => {
    setSaving(true);
    try { await updateAISettings(aiSettings); showMsg('AI settings saved'); } catch { showMsg('Failed'); } finally { setSaving(false); }
  };

  const handleGenerateKey = async () => {
    if (!keyForm.name) return showMsg('Key name required');
    setSaving(true);
    try {
      const res = await generateOutwardKey(keyForm);
      setCreatedKey(res.data.data);
      setShowKeyForm(false);
      setKeyForm({ name: '', scopes: [] });
      loadAllData();
      showMsg('Key generated');
    } catch (err) { showMsg(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const handleRevokeKey = (id) => {
    Alert.alert('Revoke', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Revoke', style: 'destructive', onPress: async () => { await revokeOutwardKey(id); loadAllData(); showMsg('Key revoked'); } },
    ]);
  };

  const handleChangePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) return showMsg('Fill both fields');
    setSaving(true);
    try { await changePassword(pwForm); setShowPasswordForm(false); setPwForm({ currentPassword: '', newPassword: '' }); showMsg('Password changed'); } catch { showMsg('Failed'); } finally { setSaving(false); }
  };

  const handleRemoveDevice = async (id) => { try { await removeTrustedDevice(id); loadAllData(); showMsg('Device removed'); } catch {} };

  const handleSaveBackup = async () => {
    setSaving(true);
    try { await updateBackupSettings(backupSettings); showMsg('Backup settings saved'); } catch { showMsg('Failed'); } finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <View style={styles.flex}>
      <HeaderBar title="Settings" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
        {tabs.map(tab => (
          <TouchableOpacity key={tab.key} onPress={() => setActiveTab(tab.key)} style={[styles.tab, activeTab === tab.key && styles.tabActive]}>
            <Ionicons name={tab.icon} size={16} color={activeTab === tab.key ? '#10B981' : '#6B7280'} />
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {msg ? <View style={styles.msgBar}><Text style={styles.msgText}>{msg}</Text></View> : null}

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* PROFILE */}
        {activeTab === 'profile' && (
          <Card style={styles.card}>
            <View style={styles.profileRow}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{user?.firstName?.[0]}{user?.lastName?.[0]}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.profileName}>{user?.firstName} {user?.lastName}</Text>
                <Text style={styles.profileEmail}>{user?.email}</Text>
                <Badge variant="info">{user?.role?.replace('_', ' ')}</Badge>
              </View>
            </View>
            <TouchableOpacity style={[styles.btn, { marginTop: 16 }]} onPress={() => setShowPasswordForm(true)}><Text style={styles.btnText}>Change Password</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnDanger, { marginTop: 8 }]} onPress={handleLogout}><Text style={[styles.btnText, { color: '#EF4444' }]}>Logout</Text></TouchableOpacity>
          </Card>
        )}

        {/* COMPANY */}
        {activeTab === 'company' && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Company Information</Text>
            <Input label="Company Name" value={company.companyName || ''} onChangeText={(v) => setCompany(p => ({ ...p, companyName: v }))} />
            <Input label="Email" value={company.contactEmail || ''} onChangeText={(v) => setCompany(p => ({ ...p, contactEmail: v }))} keyboardType="email-address" />
            <Input label="Phone" value={company.contactPhone || ''} onChangeText={(v) => setCompany(p => ({ ...p, contactPhone: v }))} keyboardType="phone-pad" />
            <Select label="Currency" value={company.currency || 'KSh'} onValueChange={(v) => setCompany(p => ({ ...p, currency: v }))} options={['KSh','USD','EUR','GBP'].map(c=>({label:c,value:c}))} />
            <TouchableOpacity style={[styles.btn, { marginTop: 16 }]} onPress={handleSaveCompany} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save Changes</Text>}
            </TouchableOpacity>
          </Card>
        )}

        {/* USERS */}
        {activeTab === 'users' && (
          <Card style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Users ({users.length})</Text>
              <TouchableOpacity onPress={() => setShowUserForm(true)}><Text style={{ color: '#10B981', fontWeight: '600' }}>+ Add</Text></TouchableOpacity>
            </View>
            {users.map(u => (
              <View key={u._id} style={styles.listRow}>
                <View style={{ flex: 1 }}><Text style={styles.listName}>{u.firstName} {u.lastName}</Text><Text style={styles.listSub}>{u.email}</Text></View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Badge variant="info">{u.role?.replace('_',' ')}</Badge>
                  <TouchableOpacity onPress={() => handleDeleteUser(u._id)}><Ionicons name="trash-outline" size={18} color="#EF4444" /></TouchableOpacity>
                </View>
              </View>
            ))}
          </Card>
        )}

        {/* MODULES */}
        {activeTab === 'modules' && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Module Toggles</Text>
            <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>Plan: <Text style={{ fontWeight: '600' }}>{plan || 'N/A'}</Text></Text>
            {moduleList.map(({ key, label }) => (
              <View key={key} style={styles.toggleRow}>
                <Text style={[styles.toggleLabel, !planModules[key] && { color: '#D1D5DB' }]}>{label}</Text>
                <Toggle value={isModuleEnabled(key)} disabled={!planModules[key]} onValueChange={() => handleToggleModule(key)} />
              </View>
            ))}
          </Card>
        )}

        {/* AI */}
        {activeTab === 'ai' && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>AI Configuration</Text>
            <Select label="Key Source" value={aiSettings.keySource || 'hdm'} onValueChange={(v) => setAiSettings(p => ({ ...p, keySource: v }))} options={[{label:'Use HDM AI',value:'hdm'},{label:'Bring Your Own',value:'own'}]} />
            {aiSettings.keySource === 'own' && (
              <>
                <Select label="Provider" value={aiSettings.provider || ''} onValueChange={(v) => setAiSettings(p=>({...p,provider:v}))} options={['openai','anthropic','deepseek','gemini','mistral','cohere'].map(p=>({label:p,value:p}))} />
                <Input label="Model" value={aiSettings.model || ''} onChangeText={(v) => setAiSettings(p=>({...p,model:v}))} />
                <Input label="API Key" value={aiSettings.apiKey || ''} onChangeText={(v) => setAiSettings(p=>({...p,apiKey:v}))} secureTextEntry />
              </>
            )}
            <Text style={{ fontSize: 13, fontWeight: '600', marginTop: 12, marginBottom: 6 }}>Module Scopes</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {scopeList.map(s => {
                const active = (aiSettings.moduleScopes || []).includes(s);
                return (
                  <TouchableOpacity key={s} onPress={() => { const scopes = [...(aiSettings.moduleScopes||[])]; setAiSettings(p=>({...p,moduleScopes:scopes.includes(s)?scopes.filter(x=>x!==s):[...scopes,s]})); }} style={[styles.chip, active && styles.chipActive]}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{s}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity style={[styles.btn, { marginTop: 16 }]} onPress={handleSaveAI} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save AI Settings</Text>}
            </TouchableOpacity>
          </Card>
        )}

        {/* API KEYS */}
        {activeTab === 'keys' && (
          <Card style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>API Keys</Text>
              <TouchableOpacity onPress={() => setShowKeyForm(true)}><Text style={{ color: '#10B981', fontWeight: '600' }}>+ Generate</Text></TouchableOpacity>
            </View>
            {createdKey && (
              <View style={styles.keyBox}>
                <Text style={{ fontWeight: '600', color: '#065F46', marginBottom: 4 }}>✅ Key Created — Copy it now!</Text>
                <Text style={{ fontFamily: 'monospace', color: '#10B981', fontWeight: '700' }} selectable>{createdKey.key}</Text>
              </View>
            )}
            {apiKeys.map(k => (
              <View key={k._id} style={styles.listRow}>
                <View style={{ flex: 1 }}><Text style={styles.listName}>{k.name}</Text><Text style={styles.listSub}>{k.scopes?.length || 0} scopes</Text></View>
                <TouchableOpacity onPress={() => handleRevokeKey(k._id)}><Ionicons name="trash-outline" size={18} color="#EF4444" /></TouchableOpacity>
              </View>
            ))}
          </Card>
        )}

        {/* BILLING */}
        {activeTab === 'billing' && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Billing & Plan</Text>
            <View style={styles.listRow}><Text style={{ color: '#6B7280' }}>Current Plan</Text><Badge variant="success">{billing.currentPlan || 'N/A'}</Badge></View>
            <View style={styles.listRow}><Text style={{ color: '#6B7280' }}>Status</Text><Text>{billing.status || 'N/A'}</Text></View>
            <View style={styles.listRow}><Text style={{ color: '#6B7280' }}>Expires</Text><Text>{billing.subscriptionExpiry ? new Date(billing.subscriptionExpiry).toLocaleDateString() : 'N/A'}</Text></View>
          </Card>
        )}

        {/* SECURITY */}
        {activeTab === 'security' && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Trusted Devices</Text>
            {devices.map(d => (
              <View key={d._id} style={styles.listRow}>
                <View style={{ flex: 1 }}><Text style={styles.listName}>{d.deviceName || 'Unknown'}</Text><Text style={styles.listSub}>Last: {d.lastUsed ? new Date(d.lastUsed).toLocaleDateString() : 'N/A'}</Text></View>
                <TouchableOpacity onPress={() => handleRemoveDevice(d._id)}><Ionicons name="trash-outline" size={18} color="#EF4444" /></TouchableOpacity>
              </View>
            ))}
          </Card>
        )}

        {/* BACKUPS */}
        {activeTab === 'backups' && (
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Backup Configuration</Text>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Auto Backups</Text>
              <Toggle value={backupSettings?.enabled || false} onValueChange={(v) => setBackupSettings(p => ({ ...p, enabled: v }))} />
            </View>
            {backupSettings?.enabled && (
              <>
                <Select label="Frequency" value={backupSettings.frequency || 'daily'} onValueChange={(v) => setBackupSettings(p=>({...p,frequency:v}))} options={['daily','weekly','monthly'].map(f=>({label:f,value:f}))} />
                <Input label="Time" value={backupSettings.time || '02:00'} onChangeText={(v) => setBackupSettings(p=>({...p,time:v}))} />
              </>
            )}
            <TouchableOpacity style={[styles.btn, { marginTop: 12 }]} onPress={handleSaveBackup} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save</Text>}
            </TouchableOpacity>
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>History</Text>
            {backupHistory.slice(0,5).map(b => (
              <View key={b._id} style={styles.listRow}><View style={{flex:1}}><Text style={styles.listName}>{b.filename}</Text><Text style={styles.listSub}>{new Date(b.createdAt).toLocaleDateString()}</Text></View></View>
            ))}
          </Card>
        )}
      </ScrollView>

      {/* User Form Modal */}
      <Modal open={showUserForm} onClose={() => setShowUserForm(false)} title="Add User">
        <Input label="First Name *" value={userForm.firstName} onChangeText={(v) => setUserForm(p => ({ ...p, firstName: v }))} />
        <Input label="Last Name *" value={userForm.lastName} onChangeText={(v) => setUserForm(p => ({ ...p, lastName: v }))} />
        <Input label="Email *" value={userForm.email} onChangeText={(v) => setUserForm(p => ({ ...p, email: v }))} keyboardType="email-address" />
        <Input label="Password *" value={userForm.password} onChangeText={(v) => setUserForm(p => ({ ...p, password: v }))} secureTextEntry />
        <Select label="Role" value={userForm.role} onValueChange={(v) => setUserForm(p => ({ ...p, role: v }))} options={roles} />
        <TouchableOpacity style={[styles.btn, { marginTop: 16 }]} onPress={handleInviteUser} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Invite User</Text>}
        </TouchableOpacity>
      </Modal>

      {/* Key Form Modal */}
      <Modal open={showKeyForm} onClose={() => setShowKeyForm(false)} title="Generate API Key">
        <Input label="Key Name" value={keyForm.name} onChangeText={(v) => setKeyForm(p => ({ ...p, name: v }))} />
        <Text style={{ fontSize: 13, fontWeight: '600', marginTop: 8, marginBottom: 6 }}>Module Scopes</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {scopeList.map(s => {
            const active = keyForm.scopes.includes(s);
            return (
              <TouchableOpacity key={s} onPress={() => setKeyForm(p=>({...p,scopes:p.scopes.includes(s)?p.scopes.filter(x=>x!==s):[...p.scopes,s]}))} style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{s}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity style={[styles.btn, { marginTop: 16 }]} onPress={handleGenerateKey} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Generate Key</Text>}
        </TouchableOpacity>
      </Modal>

      {/* Password Modal */}
      <Modal open={showPasswordForm} onClose={() => setShowPasswordForm(false)} title="Change Password">
        <Input label="Current Password" value={pwForm.currentPassword} onChangeText={(v) => setPwForm(p => ({ ...p, currentPassword: v }))} secureTextEntry />
        <Input label="New Password" value={pwForm.newPassword} onChangeText={(v) => setPwForm(p => ({ ...p, newPassword: v }))} secureTextEntry />
        <TouchableOpacity style={[styles.btn, { marginTop: 16 }]} onPress={handleChangePassword} disabled={saving}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Update Password</Text>}
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#F9FAFB' },
  tabScroll: { maxHeight: 44, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 10 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#10B981' },
  tabText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  tabTextActive: { color: '#10B981', fontWeight: '600' },
  content: { flex: 1 },
  card: { margin: 12, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
  profileName: { fontSize: 17, fontWeight: '600', color: '#111827' },
  profileEmail: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  btn: { backgroundColor: '#10B981', paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  btnDanger: { backgroundColor: '#FEE2E2' },
  btnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  listRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  listName: { fontSize: 14, fontWeight: '500', color: '#111827' },
  listSub: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  toggleLabel: { fontSize: 14, color: '#111827' },
  keyBox: { backgroundColor: '#D1FAE5', borderRadius: 10, padding: 14, marginBottom: 12 },
  chip: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  chipActive: { backgroundColor: '#10B981' },
  chipText: { color: '#6B7280', fontSize: 12, fontWeight: '500' },
  chipTextActive: { color: '#FFFFFF' },
  msgBar: { backgroundColor: '#10B981', padding: 10, alignItems: 'center' },
  msgText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
});

export default SettingsScreen;
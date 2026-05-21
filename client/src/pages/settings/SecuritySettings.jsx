import { useState, useEffect } from 'react';
import { getTrustedDevices, removeTrustedDevice, changePassword } from '../../api/tenant/securityApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import { Shield, Smartphone, Monitor, Trash2 } from 'lucide-react';

const SecuritySettings = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [pwMessage, setPwMessage] = useState('');
  const [pwSaving, setPwSaving] = useState(false);

  const fetchDevices = () => {
    getTrustedDevices()
      .then(res => setDevices(res.data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDevices(); }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      return setPwMessage({ type: 'error', text: 'Both fields required.' });
    }
    setPwSaving(true);
    try {
      await changePassword(pwForm);
      setPwMessage({ type: 'success', text: 'Password changed.' });
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPwMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' });
    } finally { setPwSaving(false); }
  };

  const handleRemoveDevice = async (id) => {
    try {
      await removeTrustedDevice(id);
      fetchDevices();
    } catch {}
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Password</h2>
        {pwMessage && <Alert variant={pwMessage.type} message={pwMessage.text} onClose={() => setPwMessage('')} />}
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label><Input type="password" value={pwForm.currentPassword} onChange={e => setPwForm({...pwForm, currentPassword: e.target.value})} /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label><Input type="password" value={pwForm.newPassword} onChange={e => setPwForm({...pwForm, newPassword: e.target.value})} /></div>
          <Button type="submit" disabled={pwSaving}>{pwSaving ? 'Changing...' : 'Update Password'}</Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trusted Devices</h2>
        {devices.length === 0 ? (
          <p className="text-sm text-gray-400">No trusted devices.</p>
        ) : (
          <div className="space-y-3">
            {devices.map(d => (
              <div key={d._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  {d.deviceName?.includes('Mobile') ? <Smartphone size={18} className="text-gray-400" /> : <Monitor size={18} className="text-gray-400" />}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{d.deviceName || 'Unknown Device'}</p>
                    <p className="text-xs text-gray-400">Last used: {d.lastUsed ? new Date(d.lastUsed).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
                <button onClick={() => handleRemoveDevice(d._id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default SecuritySettings;
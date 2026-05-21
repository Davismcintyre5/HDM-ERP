import { useState, useEffect } from 'react';
import { getBackupSettings, updateBackupSettings, getBackupHistory } from '../../api/tenant/backupApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Toggle from '../../components/ui/Toggle';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { HardDrive, Download, Clock, Play, Trash2, Share2 } from 'lucide-react';
import api from '../../api/axios';

const BackupSettings = () => {
  const [settings, setSettings] = useState({ enabled: false, frequency: 'daily', time: '02:00', retention: { keepDays: 30, maxBackups: 10 } });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const fetchData = () => {
    Promise.all([getBackupSettings(), getBackupHistory()])
      .then(([sRes, hRes]) => {
        if (sRes.data.data) setSettings(prev => ({ ...prev, ...sRes.data.data, retention: { ...prev.retention, ...sRes.data.data.retention } }));
        setHistory(hRes.data.data || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBackupSettings(settings);
      setMessage({ type: 'success', text: 'Backup settings saved.' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to save.' });
    } finally { setSaving(false); }
  };

  const handleRunBackup = async () => {
    setRunning(true);
    try {
      await api.post('/tenant/backups/run');
      setMessage({ type: 'success', text: 'Backup started! Check history shortly.' });
      setTimeout(fetchData, 3000);
    } catch {
      setMessage({ type: 'error', text: 'Failed to run backup.' });
    } finally { setRunning(false); }
  };

const handleDownload = async (filename) => {
    try {
      const response = await api.get(`/tenant/backups/download/${filename}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setMessage({ type: 'error', text: 'Download failed.' });
    }
  };

  const handleShare = (filename) => {
    const url = `${api.defaults.baseURL}/tenant/backups/download/${filename}`;
    if (navigator.share) {
      navigator.share({ title: 'Backup', text: 'HDM ERP Backup', url });
    } else {
      navigator.clipboard.writeText(url);
      setMessage({ type: 'success', text: 'Link copied to clipboard.' });
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/tenant/backups/${deleteId}`);
      setMessage({ type: 'success', text: 'Backup deleted.' });
      setDeleteId(null);
      fetchData();
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete.' });
    }
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Configuration */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Backup Configuration</h2>
          <Button size="sm" onClick={handleRunBackup} disabled={running}>
            <Play size={14} className="mr-1" /> {running ? 'Running...' : 'Backup Now'}
          </Button>
        </div>
        {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}
        <div className="space-y-4">
          <Toggle label="Enable Automatic Backups" checked={settings.enabled} onChange={e => setSettings({ ...settings, enabled: e.target.checked })} />
          {settings.enabled && (
            <>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Frequency</label>
                <Select value={settings.frequency} onChange={e => setSettings({ ...settings, frequency: e.target.value })}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </Select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Time</label>
                <Input type="time" value={settings.time} onChange={e => setSettings({ ...settings, time: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Keep Days</label>
                  <Input type="number" value={settings.retention.keepDays} onChange={e => setSettings({ ...settings, retention: { ...settings.retention, keepDays: parseInt(e.target.value) || 30 } })} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Max Backups</label>
                  <Input type="number" value={settings.retention.maxBackups} onChange={e => setSettings({ ...settings, retention: { ...settings.retention, maxBackups: parseInt(e.target.value) || 10 } })} />
                </div>
              </div>
            </>
          )}
          <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</Button>
        </div>
      </Card>

      {/* History */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Backup History</h2>
        {history.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">No backups yet. Click "Backup Now" to create one.</p>
        ) : (
          <div className="space-y-2">
            {history.slice(0, 15).map(b => (
              <div key={b._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <HardDrive size={16} className="text-gray-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{b.filename}</p>
                    <p className="text-xs text-gray-400">
                      <Clock size={10} className="inline mr-1" />
                      {new Date(b.createdAt).toLocaleString()} • {b.sizeBytes ? `${(b.sizeBytes / 1024).toFixed(1)} KB` : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-3">
                  <Badge variant={b.status === 'success' ? 'success' : 'danger'}>{b.status}</Badge>
                  {b.status === 'success' && (
                    <>
                      <button onClick={() => handleDownload(b.filename)} className="p-1.5 text-gray-400 hover:text-primary-500 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Download">
                        <Download size={14} />
                      </button>
                      <button onClick={() => handleShare(b.filename)} className="p-1.5 text-gray-400 hover:text-primary-500 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Share">
                        <Share2 size={14} />
                      </button>
                    </>
                  )}
                  <button onClick={() => setDeleteId(b._id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-gray-100 dark:hover:bg-gray-700" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Backup" message="Are you sure you want to delete this backup?" />
    </div>
  );
};

export default BackupSettings;
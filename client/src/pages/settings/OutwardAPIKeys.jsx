import { useState, useEffect } from 'react';
import { getOutwardKeys, generateOutwardKey, revokeOutwardKey } from '../../api/tenant/aiApi';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { Key, Trash2, Plus, Copy, Link, Terminal, Check } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || 'https://hdmerpserver.pxxl.click/api').replace(/\/api$/, '') + '/api';

const modules = ['finance', 'hr', 'sales', 'inventory', 'supplyChain', 'manufacturing', 'contacts', 'products', 'reports'];

const OutwardAPIKeys = () => {
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newKey, setNewKey] = useState({ name: '', scopes: [] });
  const [createdKey, setCreatedKey] = useState(null);
  const [message, setMessage] = useState('');
  const [urlCopied, setUrlCopied] = useState(false);

  const fetchKeys = () => {
    getOutwardKeys()
      .then(res => setKeys(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchKeys(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newKey.name) return setMessage({ type: 'error', text: 'Key name is required' });
    try {
      const res = await generateOutwardKey(newKey);
      setCreatedKey(res.data.data);
      setNewKey({ name: '', scopes: [] });
      setShowCreate(false);
      fetchKeys();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create key.' });
    }
  };

  const handleRevoke = async (id) => {
    try {
      await revokeOutwardKey(id);
      fetchKeys();
      setMessage({ type: 'success', text: 'Key revoked.' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to revoke.' });
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(`${API_BASE}/tenant/ai/outward`);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  };

  const copyKey = (text) => {
    navigator.clipboard.writeText(text);
    setMessage({ type: 'success', text: 'Key copied.' });
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <Card className="p-6 max-w-3xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Outward API Keys</h2>
        <Button size="sm" onClick={() => { setShowCreate(true); setMessage(''); }}>
          <Plus size={14} className="mr-1" /> Generate
        </Button>
      </div>

      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}

      {/* API Base URL Info */}
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Link size={16} className="text-blue-500" />
          <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">API Base URL</span>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded px-3 py-2 border border-blue-200 dark:border-blue-800">
          <code className="flex-1 text-sm text-gray-900 dark:text-gray-100 break-all">{API_BASE}/tenant/ai/outward</code>
          <button onClick={copyUrl} className="text-blue-500 hover:text-blue-600 shrink-0" title="Copy URL">
            {urlCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          </button>
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1">
          <Terminal size={12} />
          Use this base URL with your API key in the <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded text-xs">x-api-key</code> header.
        </p>
      </div>

      {/* Example curl */}
      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Example Request</p>
        <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap">
{`curl -H "x-api-key: YOUR_KEY_HERE" \\
  -X POST ${API_BASE}/tenant/ai/outward/query \\
  -H "Content-Type: application/json" \\
  -d '{"question":"What is my revenue?"}'`}
        </pre>
      </div>

      {createdKey && (
        <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Key size={16} className="text-emerald-500" />
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Key Created Successfully</p>
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-2">Copy it now — it won't be shown again.</p>
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 rounded-lg px-3 py-2 border border-emerald-200 dark:border-emerald-800">
            <code className="flex-1 text-xs text-gray-900 dark:text-gray-100 break-all">{createdKey.key}</code>
            <button onClick={() => copyKey(createdKey.key)} className="p-1 text-emerald-500 hover:text-emerald-600 shrink-0" title="Copy">
              <Copy size={14} />
            </button>
          </div>
          <button onClick={() => setCreatedKey(null)} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline mt-2">Dismiss</button>
        </div>
      )}

      {keys.length === 0 && !createdKey ? (
        <div className="text-center py-10 text-gray-400">
          <Key size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No API keys yet</p>
          <p className="text-xs">Generate one to allow external access to your ERP data.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-2 text-left text-gray-500 dark:text-gray-400 font-medium text-xs">Name</th>
                <th className="py-2 text-left text-gray-500 dark:text-gray-400 font-medium text-xs">Prefix</th>
                <th className="py-2 text-left text-gray-500 dark:text-gray-400 font-medium text-xs">Scopes</th>
                <th className="py-2 text-left text-gray-500 dark:text-gray-400 font-medium text-xs">Last Used</th>
                <th className="py-2 text-right text-gray-500 dark:text-gray-400 font-medium text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.map(k => (
                <tr key={k._id} className="border-b border-gray-100 dark:border-gray-700/50">
                  <td className="py-2 text-gray-900 dark:text-gray-100 font-medium">{k.name}</td>
                  <td className="py-2 text-gray-500 dark:text-gray-400 text-xs font-mono">{k.prefix || 'hdm_sk'}</td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-1">
                      {k.scopes?.length > 0
                        ? k.scopes.map(s => <Badge key={s} variant="info">{s}</Badge>)
                        : <span className="text-xs text-gray-400">All modules</span>
                      }
                    </div>
                  </td>
                  <td className="py-2 text-gray-500 dark:text-gray-400 text-xs">
                    {k.lastUsed ? new Date(k.lastUsed).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => handleRevoke(k._id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Revoke"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Generate Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Generate API Key">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Key Name *</label>
            <Input
              placeholder="e.g. Mobile App, Webhook Integration"
              value={newKey.name}
              onChange={e => setNewKey({ ...newKey, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Module Scopes</label>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Select which modules this key can access. None selected = all modules.</p>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {modules.map(m => (
                <label
                  key={m}
                  className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-sm transition-colors ${
                    newKey.scopes.includes(m)
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={newKey.scopes.includes(m)}
                    onChange={() => setNewKey({
                      ...newKey,
                      scopes: newKey.scopes.includes(m)
                        ? newKey.scopes.filter(s => s !== m)
                        : [...newKey.scopes, m]
                    })}
                    className="sr-only"
                  />
                  <span className="text-xs">{m.charAt(0).toUpperCase() + m.slice(1).replace(/([A-Z])/g, ' $1')}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowCreate(false)} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1">Generate Key</Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};

export default OutwardAPIKeys;
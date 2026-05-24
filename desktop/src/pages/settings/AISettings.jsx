import { useState, useEffect } from 'react';
import { getAISettings, updateAISettings } from '../../api/tenant/aiApi';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import Toggle from '../../components/ui/Toggle';

const AISettings = () => {
  const [form, setForm] = useState({ keySource: 'hdm', provider: '', model: '', apiKey: '', moduleScopes: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const modules = ['finance', 'hr', 'sales', 'inventory', 'supplyChain', 'manufacturing', 'contacts', 'products', 'reports'];

  useEffect(() => {
    getAISettings()
      .then(res => {
        if (res.data.data) {
          setForm(prev => ({
            ...prev,
            ...res.data.data,
            moduleScopes: res.data.data.moduleScopes || []
          }));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const toggleScope = (mod) => {
    setForm(prev => ({
      ...prev,
      moduleScopes: prev.moduleScopes.includes(mod)
        ? prev.moduleScopes.filter(s => s !== mod)
        : [...prev.moduleScopes, mod]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAISettings(form);
      setMessage({ type: 'success', text: 'AI settings saved.' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to save.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <Card className="p-6 max-w-2xl">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Configuration</h2>
      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">AI Key Source</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="keySource" value="hdm" checked={form.keySource === 'hdm'} onChange={handleChange} />
              <span className="text-sm text-gray-700 dark:text-gray-300">Use HDM AI</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="keySource" value="own" checked={form.keySource === 'own'} onChange={handleChange} />
              <span className="text-sm text-gray-700 dark:text-gray-300">Bring Your Own Key</span>
            </label>
          </div>
        </div>

        {form.keySource === 'own' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Provider</label>
              <Select name="provider" value={form.provider} onChange={handleChange}>
                <option value="">Select provider</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic (Claude)</option>
                <option value="deepseek">DeepSeek</option>
                <option value="gemini">Google Gemini</option>
                <option value="mistral">Mistral AI</option>
                <option value="cohere">Cohere</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model</label>
              <Input name="model" placeholder="e.g. gpt-4, claude-3.5-sonnet" value={form.model} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">API Key</label>
              <Input name="apiKey" type="password" placeholder="sk-..." value={form.apiKey} onChange={handleChange} />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Module Scopes</label>
          <p className="text-xs text-gray-400 mb-2">Select which modules the AI can access</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {modules.map(m => (
              <Toggle
                key={m}
                label={m.charAt(0).toUpperCase() + m.slice(1).replace(/([A-Z])/g, ' $1')}
                checked={form.moduleScopes.includes(m)}
                onChange={() => toggleScope(m)}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default AISettings;
import { useState, useEffect } from 'react';
import { getReports, saveReport, runReport, deleteReport } from '../../api/tenant/reportsApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Plus, Eye, Trash2, Play, FileText, Printer } from 'lucide-react';
import formatDate from '../../utils/formatDate';
import { printTable } from '../../utils/printUtils';

const modules = ['finance', 'hr', 'sales', 'inventory', 'supply_chain', 'manufacturing', 'all'];
const reportTypes = ['tabular', 'chart', 'summary'];

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('saved');
  const [showForm, setShowForm] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ name: '', module: 'finance', type: 'tabular', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { getReports().then(res => setReports(res.data.data || [])).finally(() => setLoading(false)); }, []);

  const handleSave = async (e) => {
    e.preventDefault(); if (!form.name) return;
    setSaving(true);
    try { await saveReport(form); setShowForm(false); setForm({ name: '', module: 'finance', type: 'tabular', description: '' }); getReports().then(res => setReports(res.data.data || [])); setMessage({ type: 'success', text: 'Report saved.' }); }
    catch { setMessage({ type: 'error', text: 'Failed.' }); } finally { setSaving(false); }
  };

  const handleRun = async (id) => {
    try { const res = await runReport(id); setViewData(res.data.data); }
    catch { setMessage({ type: 'error', text: 'Failed to run.' }); }
  };

  const handleDelete = async () => {
    try { await deleteReport(deleteId); setDeleteId(null); getReports().then(res => setReports(res.data.data || [])); }
    catch { setMessage({ type: 'error', text: 'Failed.' }); }
  };

  const formatValue = (val) => {
    if (val === null || val === undefined) return '—';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    if (val instanceof Date || (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}/))) return formatDate(val);
    if (typeof val === 'number') return val.toLocaleString();
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

const handlePrint = () => {
    if (!viewData) return;
    
    const formatRows = (arr) => {
      if (!arr || !arr.length) return 'No records';
      const headers = Object.keys(arr[0]).filter(f => !['_id', 'tenantId', '__v', 'createdBy', 'items'].includes(f));
      let html = '<table><thead><tr>';
      headers.forEach(h => html += `<th>${h.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').toUpperCase()}</th>`);
      html += '</tr></thead><tbody>';
      arr.forEach(row => {
        html += '<tr>';
        headers.forEach(h => html += `<td>${formatValue(row[h])}</td>`);
        html += '</tr>';
      });
      html += '</tbody></table>';
      return html;
    };

    let content = '';
    if (typeof viewData === 'object' && !Array.isArray(viewData)) {
      // Summary section
      content += '<div style="margin-bottom:15px;">';
      Object.entries(viewData).forEach(([k, v]) => {
        if (!Array.isArray(v) && typeof v !== 'object') {
          content += `<p><strong>${k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}:</strong> ${formatValue(v)}</p>`;
        }
      });
      content += '</div>';
      // Arrays
      Object.entries(viewData).forEach(([k, v]) => {
        if (Array.isArray(v)) {
          content += `<h4 style="margin-bottom:5px;">${k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')} (${v.length})</h4>`;
          content += formatRows(v);
        }
      });
    } else if (Array.isArray(viewData)) {
      content = formatRows(viewData);
    } else {
      Object.entries(viewData).forEach(([k, v]) => {
        content += `<p><strong>${k}:</strong> ${formatValue(v)}</p>`;
      });
    }

    import('../../utils/printUtils').then(m => m.printContent(content, { title: 'Report Results' }));
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1></div>
        <Button size="sm" onClick={() => setShowForm(true)}><Plus size={14} className="mr-1" /> New Report</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button onClick={() => setActiveTab('saved')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'saved' ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}>Saved Reports</button>
        <button onClick={() => setActiveTab('builder')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'builder' ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}>Report Builder</button>
      </div>

      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}

      {activeTab === 'saved' && (
        <>
          {reports.length === 0 ? (
            <div className="text-center py-16 text-gray-400"><FileText size={48} className="mx-auto mb-4 opacity-50" /><p>No saved reports.</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map(r => (
                <Card key={r._id} className="p-4">
                  <FileText size={20} className="text-primary-500 mb-2" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{r.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{r.module} • {r.type}</p>
                  {r.description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{r.description}</p>}
                  <div className="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <Button size="sm" variant="ghost" onClick={() => handleRun(r._id)}><Play size={12} className="mr-1" /> Run</Button>
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => setDeleteId(r._id)}><Trash2 size={12} className="mr-1" /> Delete</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'builder' && (
        <Card className="p-6 max-w-lg">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create Report</h2>
          <form onSubmit={handleSave} className="space-y-3">
            <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Report Name *</label><Input value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} required /></div>
            <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Module</label><Select value={form.module} onChange={e => setForm(prev => ({ ...prev, module: e.target.value }))}>{modules.map(m => <option key={m} value={m}>{m}</option>)}</Select></div>
            <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Type</label><Select value={form.type} onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}>{reportTypes.map(t => <option key={t} value={t}>{t}</option>)}</Select></div>
            <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Description</label><Input value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} /></div>
            <Button type="submit" disabled={saving} className="w-full">{saving ? 'Saving...' : 'Save Report'}</Button>
          </form>
        </Card>
      )}

{/* Run Results Modal */}
{viewData && (
  <Modal open={!!viewData} onClose={() => setViewData(null)} title="Report Results" className="max-w-4xl">
    <div className="space-y-4 max-h-[65vh] overflow-y-auto">
      {(() => {
        // Flatten: if data has summary numbers + arrays, show summary cards first, then tables
        if (typeof viewData === 'object' && !Array.isArray(viewData)) {
          const keys = Object.keys(viewData);
          const arrayKeys = keys.filter(k => Array.isArray(viewData[k]));
          const scalarKeys = keys.filter(k => !Array.isArray(viewData[k]) && typeof viewData[k] !== 'object');
          const objectKeys = keys.filter(k => typeof viewData[k] === 'object' && !Array.isArray(viewData[k]));

          return (
            <>
              {/* Summary cards */}
              {scalarKeys.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {scalarKeys.map(k => (
                    <div key={k} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500 capitalize">{k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</p>
                      <p className="text-lg font-bold text-primary-500">{formatValue(viewData[k])}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Nested objects as key-value */}
              {objectKeys.map(k => (
                <div key={k}>
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 capitalize">{k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</h4>
                  <div className="space-y-1 mb-3">
                    {Object.entries(viewData[k]).map(([sk, sv]) => (
                      <div key={sk} className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700/50 text-xs">
                        <span className="text-gray-500 capitalize">{sk.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</span>
                        <span className="text-gray-900 dark:text-white font-medium">{formatValue(sv)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Array tables */}
              {arrayKeys.map(k => (
                <div key={k} className="mb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 capitalize">{k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')} ({viewData[k].length})</h4>
                  {viewData[k].length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead><tr className="border-b border-gray-200 dark:border-gray-700">
                          {Object.keys(viewData[k][0]).filter(f => !['_id', 'tenantId', '__v', 'createdBy', 'items'].includes(f)).map(f => (
                            <th key={f} className="py-1.5 px-2 text-left text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap capitalize">{f.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</th>
                          ))}
                        </tr></thead>
                        <tbody>
                          {viewData[k].slice(0, 50).map((row, i) => (
                            <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50">
                              {Object.keys(row).filter(f => !['_id', 'tenantId', '__v', 'createdBy', 'items'].includes(f)).map(f => (
                                <td key={f} className="py-1.5 px-2 text-gray-700 dark:text-gray-300 whitespace-nowrap">{formatValue(row[f])}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : <p className="text-xs text-gray-400">No records</p>}
                </div>
              ))}
            </>
          );
        }

        // Simple array
        if (Array.isArray(viewData) && viewData.length > 0) {
          return (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-gray-200 dark:border-gray-700">
                  {Object.keys(viewData[0]).filter(f => !['_id', 'tenantId', '__v'].includes(f)).map(f => (
                    <th key={f} className="py-1.5 px-2 text-left text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap capitalize">{f.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</th>
                  ))}
                </tr></thead>
                <tbody>{viewData.map((row, i) => <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50">{Object.keys(row).filter(f => !['_id', 'tenantId', '__v'].includes(f)).map(f => <td key={f} className="py-1.5 px-2 text-gray-700 dark:text-gray-300 whitespace-nowrap">{formatValue(row[f])}</td>)}</tr>)}</tbody>
              </table>
            </div>
          );
        }

        // Fallback: key-value
        return (
          <div className="space-y-1">
            {Object.entries(viewData).map(([k, v]) => (
              <div key={k} className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-700/50">
                <span className="text-gray-500 text-xs capitalize">{k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ')}</span>
                <span className="text-gray-900 dark:text-white text-xs font-medium">{formatValue(v)}</span>
              </div>
            ))}
          </div>
        );
      })()}
      <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <Button size="sm" variant="outline" onClick={handlePrint}><Printer size={14} className="mr-1" /> Print</Button>
        <Button size="sm" variant="ghost" onClick={() => setViewData(null)}>Close</Button>
      </div>
    </div>
  </Modal>
)}
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Report" message="Are you sure?" />
    </div>
  );
};

export default ReportsPage;
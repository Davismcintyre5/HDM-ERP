import { useState, useEffect } from 'react';
import { getMaintenances, createMaintenance, updateMaintenance, deleteMaintenance } from '../../api/tenant/assetApi';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Spinner from '../ui/Spinner';
import Alert from '../ui/Alert';
import ConfirmDialog from '../ui/ConfirmDialog';
import MaintenanceForm from './MaintenanceForm';
import { Plus, Edit3, Trash2, Wrench, Calendar, DollarSign, User, MapPin } from 'lucide-react';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';

const statusColors = { scheduled: 'info', in_progress: 'warning', completed: 'success', cancelled: 'danger' };
const typeLabels = { preventive: 'Preventive', corrective: 'Corrective', inspection: 'Inspection' };

const AssetDetail = ({ asset, users, onUpdate, onClose }) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMaintenances(asset._id)
      .then(res => setRecords(res.data.data || []))
      .finally(() => setLoading(false));
  }, [asset._id]);

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await createMaintenance(asset._id, data);
      setShowForm(false);
      setMessage({ type: 'success', text: 'Maintenance scheduled' });
      const res = await getMaintenances(asset._id);
      setRecords(res.data.data || []);
      onUpdate();
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed' }); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await updateMaintenance(editRecord._id, data);
      setShowForm(false); setEditRecord(null);
      setMessage({ type: 'success', text: 'Maintenance updated' });
      const res = await getMaintenances(asset._id);
      setRecords(res.data.data || []);
      onUpdate();
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed' }); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await deleteMaintenance(deleteId);
      setDeleteId(null);
      setMessage({ type: 'success', text: 'Record deleted' });
      const res = await getMaintenances(asset._id);
      setRecords(res.data.data || []);
      onUpdate();
    } catch { setMessage({ type: 'error', text: 'Delete failed' }); }
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage(null)} />}

      {/* Asset Info */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 grid grid-cols-2 gap-3 text-sm">
        <div><span className="text-xs text-gray-400">Code</span><p className="font-medium text-gray-900 dark:text-white">{asset.code}</p></div>
        <div><span className="text-xs text-gray-400">Status</span><p><Badge variant={statusColors[asset.status]}>{asset.status}</Badge></p></div>
        <div><span className="text-xs text-gray-400">Purchase Cost</span><p className="font-medium text-gray-900 dark:text-white">{formatCurrency(asset.purchaseCost)}</p></div>
        <div><span className="text-xs text-gray-400">Current Value</span><p className="font-medium text-primary-500">{formatCurrency(asset.currentValue)}</p></div>
        <div className="flex items-center gap-1"><MapPin size={12} className="text-gray-400" /><span className="text-xs text-gray-400">Location</span><p className="text-gray-900 dark:text-white">{asset.location || '—'}</p></div>
        <div className="flex items-center gap-1"><User size={12} className="text-gray-400" /><span className="text-xs text-gray-400">Assigned</span><p className="text-gray-900 dark:text-white">{asset.assignedTo ? `${asset.assignedTo.firstName} ${asset.assignedTo.lastName}` : '—'}</p></div>
        {asset.supplier && <div><span className="text-xs text-gray-400">Supplier</span><p className="text-gray-900 dark:text-white">{asset.supplier}</p></div>}
        {asset.warrantyExpiry && <div className="flex items-center gap-1"><Calendar size={12} className="text-gray-400" /><span className="text-xs text-gray-400">Warranty</span><p className="text-gray-900 dark:text-white">{formatDate(asset.warrantyExpiry)}</p></div>}
      </div>

      {/* Maintenance History */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Wrench size={14} /> Maintenance History</h4>
          <Button size="sm" onClick={() => { setEditRecord(null); setShowForm(true); }}>
            <Plus size={14} className="mr-1" /> Schedule
          </Button>
        </div>

        {loading ? <Spinner /> : records.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No maintenance records</p>
        ) : (
          <div className="space-y-2">
            {records.map(r => (
              <div key={r._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={r.type === 'preventive' ? 'info' : r.type === 'corrective' ? 'warning' : 'default'}>{typeLabels[r.type]}</Badge>
                      <Badge variant={statusColors[r.status]}>{r.status}</Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{r.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                      <span className="flex items-center gap-1"><Calendar size={10} /> {formatDate(r.scheduledDate)}</span>
                      {r.cost > 0 && <span className="flex items-center gap-1"><DollarSign size={10} /> {formatCurrency(r.cost)}</span>}
                      {r.vendor && <span>{r.vendor}</span>}
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    <button onClick={() => { setEditRecord(r); setShowForm(true); }} className="p-1 text-gray-400 hover:text-primary-500"><Edit3 size={12} /></button>
                    <button onClick={() => setDeleteId(r._id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={12} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Maintenance Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setShowForm(false); setEditRecord(null); }}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{editRecord ? 'Edit Maintenance' : 'Schedule Maintenance'}</h3>
            <MaintenanceForm
              initialData={editRecord}
              onSubmit={editRecord ? handleUpdate : handleCreate}
              onCancel={() => { setShowForm(false); setEditRecord(null); }}
              saving={saving}
            />
          </div>
        </div>
      )}

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Record" message="Are you sure?" />
    </div>
  );
};

export default AssetDetail;
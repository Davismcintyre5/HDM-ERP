import { useState, useEffect, useCallback } from 'react';
import { getAssets, createAsset, updateAsset, deleteAsset, depreciateAsset, getAssetStats } from '../../api/tenant/assetApi';
import { getUsers } from '../../api/tenant/usersApi';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Plus, Edit3, Trash2, Eye, Wrench, Package, DollarSign, Calendar, MapPin } from 'lucide-react';
import AssetForm from '../../components/assets/AssetForm';
import AssetDetail from '../../components/assets/AssetDetail';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';

const categoryIcons = {
  equipment: '⚙️', vehicle: '🚗', furniture: '🪑', it: '💻', building: '🏢', other: '📦'
};
const statusColors = {
  active: 'success', maintenance: 'warning', retired: 'default', disposed: 'danger'
};

const AssetsPage = () => {
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editAsset, setEditAsset] = useState(null);
  const [viewAsset, setViewAsset] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');

  const fetchAssets = useCallback(async () => {
    try {
      const [assetsRes, statsRes] = await Promise.all([getAssets(), getAssetStats()]);
      setAssets(assetsRes.data.data || []);
      setStats(statsRes.data.data);
    } catch { setMessage({ type: 'error', text: 'Failed to load assets' }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchAssets();
    getUsers().then(res => setUsers(res.data.data || [])).catch(() => {});
  }, [fetchAssets]);

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await createAsset(data);
      setShowForm(false);
      setMessage({ type: 'success', text: 'Asset created' });
      fetchAssets();
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed' }); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await updateAsset(editAsset._id, data);
      setShowForm(false); setEditAsset(null);
      setMessage({ type: 'success', text: 'Asset updated' });
      fetchAssets();
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed' }); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await deleteAsset(deleteId);
      setDeleteId(null);
      setMessage({ type: 'success', text: 'Asset deleted' });
      fetchAssets();
    } catch { setMessage({ type: 'error', text: 'Delete failed' }); }
  };

  const handleDepreciate = async (id) => {
    try {
      await depreciateAsset(id);
      setMessage({ type: 'success', text: 'Depreciation calculated' });
      fetchAssets();
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed' }); }
  };

  const categories = ['all', ...new Set(assets.map(a => a.category))];
  const filtered = activeCategory === 'all' ? assets : assets.filter(a => a.category === activeCategory);

  if (loading) return <Spinner />;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Assets</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{stats?.total || 0} assets · Total value {formatCurrency(stats?.totalValue || 0)}</p>
        </div>
        <Button onClick={() => { setEditAsset(null); setShowForm(true); }}>
          <Plus size={16} className="mr-1" /> Add Asset
        </Button>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
            <p className="text-lg font-bold text-green-500">{stats.statusCounts?.active || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">In Maintenance</p>
            <p className="text-lg font-bold text-amber-500">{stats.statusCounts?.maintenance || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Value</p>
            <p className="text-lg font-bold text-primary-500">{formatCurrency(stats.totalValue)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Pending Maint.</p>
            <p className="text-lg font-bold text-purple-500">{stats.pendingMaintenance}</p>
          </div>
        </div>
      )}

      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage(null)} />}

      {/* Category Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${activeCategory === cat ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            {cat === 'all' ? 'All' : `${categoryIcons[cat] || ''} ${cat}`}
          </button>
        ))}
      </div>

      {/* Assets Table */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-4">Code</th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Name</th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Category</th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Value</th>
                <th className="py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Location</th>
                <th className="py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a._id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="py-2.5 px-4 font-mono text-xs text-gray-500 dark:text-gray-400">{a.code}</td>
                  <td className="py-2.5 font-medium text-gray-900 dark:text-white">{a.name}</td>
                  <td className="py-2.5 text-gray-600 dark:text-gray-400">{categoryIcons[a.category]} {a.category}</td>
                  <td className="py-2.5"><Badge variant={statusColors[a.status]}>{a.status}</Badge></td>
                  <td className="py-2.5 text-right font-medium text-primary-500">{formatCurrency(a.currentValue)}</td>
                  <td className="py-2.5 text-gray-500 dark:text-gray-400 text-xs">{a.location || '—'}</td>
                  <td className="py-2.5 text-right px-4">
                    <div className="flex justify-end gap-0.5">
                      <Button size="sm" variant="ghost" onClick={() => setViewAsset(a)} title="View"><Eye size={12} /></Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEditAsset(a); setShowForm(true); }} title="Edit"><Edit3 size={12} /></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDepreciate(a._id)} title="Depreciate"><DollarSign size={12} /></Button>
                      <Button size="sm" variant="ghost" className="text-red-500" onClick={() => setDeleteId(a._id)} title="Delete"><Trash2 size={12} /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Package size={40} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No assets found</p>
            </div>
          )}
        </div>
      </div>

      {/* Form Modal */}
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditAsset(null); }} title={editAsset ? 'Edit Asset' : 'New Asset'} size="lg">
        <AssetForm
          initialData={editAsset}
          users={users}
          onSubmit={editAsset ? handleUpdate : handleCreate}
          onCancel={() => { setShowForm(false); setEditAsset(null); }}
          saving={saving}
        />
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!viewAsset} onClose={() => setViewAsset(null)} title={viewAsset?.name || 'Asset Details'} size="lg">
        {viewAsset && <AssetDetail asset={viewAsset} users={users} onUpdate={fetchAssets} onClose={() => setViewAsset(null)} />}
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Asset" message="Are you sure? Maintenance records will also be deleted." />
    </div>
  );
};

export default AssetsPage;
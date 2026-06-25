import { useState, useEffect, useCallback } from 'react';
import { getLeads, createLead, updateLead, deleteLead, updateLeadStage, getCRMStats } from '../../api/tenant/crmApi';
import { getUsers } from '../../api/tenant/usersApi';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Plus, MoreHorizontal, Edit3, Trash2, Phone, Mail, Building2, User, DollarSign, TrendingUp, Users, Target } from 'lucide-react';
import LeadForm from '../../components/crm/LeadForm';
import LeadDetail from '../../components/crm/LeadDetail';
import formatCurrency from '../../utils/formatCurrency';

const stages = [
  { key: 'lead', label: 'Lead', color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' },
  { key: 'qualified', label: 'Qualified', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  { key: 'proposal', label: 'Proposal', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
  { key: 'negotiation', label: 'Negotiation', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
  { key: 'won', label: 'Won', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  { key: 'lost', label: 'Lost', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
];

const sourceIcons = {
  website: '🌐', referral: '🤝', social: '📱', email: '📧', call: '📞', other: '📌'
};

const CRMPage = () => {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [viewLead, setViewLead] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [draggedLead, setDraggedLead] = useState(null);

  const fetchLeads = useCallback(async () => {
    try {
      const [leadsRes, statsRes] = await Promise.all([getLeads(), getCRMStats()]);
      setLeads(leadsRes.data.data || []);
      setStats(statsRes.data.data);
    } catch { setMessage({ type: 'error', text: 'Failed to load leads' }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchLeads();
    getUsers().then(res => setUsers(res.data.data || [])).catch(() => {});
  }, [fetchLeads]);

  const handleCreate = async (data) => {
    setSaving(true);
    try {
      await createLead(data);
      setShowForm(false);
      setMessage({ type: 'success', text: 'Lead created' });
      fetchLeads();
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed' }); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (data) => {
    setSaving(true);
    try {
      await updateLead(editLead._id, data);
      setShowForm(false); setEditLead(null);
      setMessage({ type: 'success', text: 'Lead updated' });
      fetchLeads();
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed' }); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await deleteLead(deleteId);
      setDeleteId(null);
      setMessage({ type: 'success', text: 'Lead deleted' });
      fetchLeads();
    } catch { setMessage({ type: 'error', text: 'Delete failed' }); }
  };

  const handleDragStart = (lead) => setDraggedLead(lead);
  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = async (stage) => {
    if (!draggedLead || draggedLead.stage === stage) return;
    try {
      await updateLeadStage(draggedLead._id, stage);
      setMessage({ type: 'success', text: `Lead moved to ${stage}` });
      fetchLeads();
    } catch { setMessage({ type: 'error', text: 'Failed to move lead' }); }
    setDraggedLead(null);
  };

  const leadsByStage = (stage) => leads.filter(l => l.stage === stage);
  const stageValue = (stage) => leadsByStage(stage).reduce((s, l) => s + (l.value || 0), 0);

  if (loading) return <Spinner />;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CRM Pipeline</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{leads.length} leads · {stats?.conversionRate || 0}% conversion</p>
        </div>
        <Button onClick={() => { setEditLead(null); setShowForm(true); }}>
          <Plus size={16} className="mr-1" /> Add Lead
        </Button>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex items-center gap-3">
            <Users size={20} className="text-primary-500" />
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Total Leads</p><p className="text-lg font-bold text-gray-900 dark:text-white">{stats.total}</p></div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex items-center gap-3">
            <DollarSign size={20} className="text-green-500" />
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Pipeline Value</p><p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalValue)}</p></div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex items-center gap-3">
            <TrendingUp size={20} className="text-green-500" />
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Won Value</p><p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(stats.wonValue)}</p></div>
          </div>
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex items-center gap-3">
            <Target size={20} className="text-primary-500" />
            <div><p className="text-xs text-gray-500 dark:text-gray-400">Conversion</p><p className="text-lg font-bold text-gray-900 dark:text-white">{stats.conversionRate}%</p></div>
          </div>
        </div>
      )}

      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage(null)} />}

      {/* Kanban Board */}
      <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: '60vh' }}>
        {stages.map(stage => (
          <div
            key={stage.key}
            className="flex-shrink-0 w-64 flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(stage.key)}
          >
            {/* Column Header */}
            <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${stage.key === 'won' ? 'bg-green-500' : stage.key === 'lost' ? 'bg-red-500' : 'bg-primary-500'}`} />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{stage.label}</span>
                <span className="text-xs text-gray-400">{leadsByStage(stage.key).length}</span>
              </div>
              {stageValue(stage.key) > 0 && (
                <span className="text-[10px] text-gray-400">{formatCurrency(stageValue(stage.key))}</span>
              )}
            </div>

            {/* Cards */}
            <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[55vh]">
              {leadsByStage(stage.key).map(lead => (
                <div
                  key={lead._id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={() => handleDragStart(lead)}
                  onClick={() => setViewLead(lead)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{lead.firstName} {lead.lastName}</p>
                    <div className="flex gap-0.5">
                      <button onClick={(e) => { e.stopPropagation(); setEditLead(lead); setShowForm(true); }} className="p-0.5 text-gray-400 hover:text-primary-500"><Edit3 size={10} /></button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteId(lead._id); }} className="p-0.5 text-gray-400 hover:text-red-500"><Trash2 size={10} /></button>
                    </div>
                  </div>
                  {lead.company && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <Building2 size={10} /> {lead.company}
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    {lead.email && <span className="flex items-center gap-1"><Mail size={10} /> {lead.email}</span>}
                    {lead.phone && <span className="flex items-center gap-1"><Phone size={10} /> {lead.phone}</span>}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-[10px] text-gray-400">{sourceIcons[lead.source]} {lead.source}</span>
                    {lead.value > 0 && <span className="text-xs font-semibold text-primary-500">{formatCurrency(lead.value)}</span>}
                  </div>
                  {lead.assignedTo && (
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                      <User size={10} /> {lead.assignedTo.firstName} {lead.assignedTo.lastName}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Lead Form Modal */}
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditLead(null); }} title={editLead ? 'Edit Lead' : 'New Lead'} size="lg">
        <LeadForm
          initialData={editLead}
          users={users}
          onSubmit={editLead ? handleUpdate : handleCreate}
          onCancel={() => { setShowForm(false); setEditLead(null); }}
          saving={saving}
        />
      </Modal>

      {/* Lead Detail Modal */}
      <Modal open={!!viewLead} onClose={() => setViewLead(null)} title="Lead Details" size="lg">
        {viewLead && <LeadDetail lead={viewLead} onUpdate={fetchLeads} onClose={() => setViewLead(null)} />}
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Lead" message="Are you sure? This will also delete all activities." />
    </div>
  );
};

export default CRMPage;
import { useState, useEffect } from 'react';
import { getActivities, createActivity, updateLeadStage, convertLead } from '../../api/tenant/crmApi';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Spinner from '../ui/Spinner';
import Alert from '../ui/Alert';
import { Phone, Mail, Building2, Calendar, User, DollarSign, MessageSquare, Plus, ArrowRight } from 'lucide-react';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';

const stageLabels = { lead: 'Lead', qualified: 'Qualified', proposal: 'Proposal', negotiation: 'Negotiation', won: 'Won', lost: 'Lost' };
const activityIcons = { call: '📞', email: '📧', meeting: '🤝', note: '📝', task: '✅' };

const LeadDetail = ({ lead, onUpdate, onClose }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [adding, setAdding] = useState(false);
  const [converting, setConverting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    getActivities({ leadId: lead._id })
      .then(res => setActivities(res.data.data || []))
      .finally(() => setLoading(false));
  }, [lead._id]);

  const addNote = async () => {
    if (!newNote.trim()) return;
    setAdding(true);
    try {
      await createActivity({ leadId: lead._id, type: 'note', subject: newNote.trim() });
      setNewNote('');
      const res = await getActivities({ leadId: lead._id });
      setActivities(res.data.data || []);
    } catch { setMessage({ type: 'error', text: 'Failed to add note' }); }
    finally { setAdding(false); }
  };

  const handleStageChange = async (stage) => {
    try {
      await updateLeadStage(lead._id, stage);
      setMessage({ type: 'success', text: `Stage changed to ${stageLabels[stage]}` });
      onUpdate();
    } catch { setMessage({ type: 'error', text: 'Failed to change stage' }); }
  };

  const handleConvert = async () => {
    setConverting(true);
    try {
      await convertLead(lead._id);
      setMessage({ type: 'success', text: 'Lead converted to customer!' });
      onUpdate();
    } catch { setMessage({ type: 'error', text: 'Conversion failed' }); }
    finally { setConverting(false); }
  };

  const nextStages = {
    lead: 'qualified', qualified: 'proposal', proposal: 'negotiation', negotiation: 'won'
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage(null)} />}

      {/* Lead Info */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{lead.firstName} {lead.lastName}</h3>
            <Badge>{stageLabels[lead.stage]}</Badge>
          </div>
          {lead.value > 0 && <span className="text-lg font-bold text-primary-500">{formatCurrency(lead.value)}</span>}
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {lead.company && <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400"><Building2 size={14} /> {lead.company}</div>}
          {lead.email && <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400"><Mail size={14} /> {lead.email}</div>}
          {lead.phone && <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400"><Phone size={14} /> {lead.phone}</div>}
          {lead.assignedTo && <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400"><User size={14} /> {lead.assignedTo.firstName} {lead.assignedTo.lastName}</div>}
          {lead.nextFollowUp && <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400"><Calendar size={14} /> Follow-up: {formatDate(lead.nextFollowUp)}</div>}
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400"><DollarSign size={14} /> Source: {lead.source}</div>
        </div>
        {lead.notes && <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{lead.notes}</p>}
      </div>

      {/* Actions */}
      {lead.stage !== 'won' && lead.stage !== 'lost' && (
        <div className="flex gap-2 flex-wrap">
          {nextStages[lead.stage] && (
            <Button size="sm" onClick={() => handleStageChange(nextStages[lead.stage])}>
              <ArrowRight size={14} className="mr-1" /> Move to {stageLabels[nextStages[lead.stage]]}
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => handleStageChange('lost')}>Mark Lost</Button>
          <Button size="sm" variant="outline" className="text-green-600" onClick={handleConvert} disabled={converting}>
            {converting ? 'Converting...' : 'Convert to Customer'}
          </Button>
        </div>
      )}

      {/* Activities */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <MessageSquare size={14} /> Activity Timeline
        </h4>

        {/* Add Note */}
        <div className="flex gap-2 mb-3">
          <input
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addNote()}
            placeholder="Add a note... (Enter to send)"
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <Button size="sm" onClick={addNote} disabled={adding || !newNote.trim()}>
            <Plus size={14} />
          </Button>
        </div>

        {/* Activity List */}
        {loading ? <Spinner /> : activities.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No activities yet</p>
        ) : (
          <div className="space-y-2">
            {activities.map(a => (
              <div key={a._id} className="flex gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg">
                <span className="text-lg shrink-0">{activityIcons[a.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">{a.subject}</p>
                  {a.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{a.description}</p>}
                  <p className="text-[10px] text-gray-400 mt-1">
                    {a.createdBy?.firstName} · {formatDate(a.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadDetail;
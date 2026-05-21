import { useState, useEffect } from 'react';
import { getWorkOrders, recordQC } from '../../api/tenant/manufacturingApi';
import Button from '../../components/ui/Button';
import SearchableSelect from '../../components/ui/SearchableSelect';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Card from '../../components/ui/Card';
import { CheckCircle, XCircle } from 'lucide-react';

const QCTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWO, setSelectedWO] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getWorkOrders().then(res => setOrders((res.data.data || []).filter(o => o.status === 'processing' || o.status === 'completed'))).finally(() => setLoading(false));
  }, []);

  const handleQC = async (pass) => {
    if (!selectedWO) return;
    setSaving(true);
    try {
      await recordQC({ workOrderId: selectedWO, pass, notes });
      setMessage({ type: 'success', text: pass ? 'Passed QC ✓' : 'Failed QC — sent for rework.' });
      setSelectedWO(''); setNotes('');
      getWorkOrders().then(res => setOrders((res.data.data || []).filter(o => o.status === 'processing' || o.status === 'completed')));
    } catch { setMessage({ type: 'error', text: 'Failed.' }); } finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-lg">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quality Control</h2>
        {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}
        <div className="space-y-3">
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Work Order</label><SearchableSelect options={orders.map(o => ({ value: o._id, label: `${o.orderNumber} — ${o.product?.name || 'N/A'}` }))} value={selectedWO} onChange={setSelectedWO} placeholder="Select WO" /></div>
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Notes</label><Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Inspection notes..." /></div>
          <div className="flex gap-2">
            <Button onClick={() => handleQC(true)} disabled={saving} className="flex-1"><CheckCircle size={14} className="mr-1" /> Pass</Button>
            <Button variant="danger" onClick={() => handleQC(false)} disabled={saving} className="flex-1"><XCircle size={14} className="mr-1" /> Fail</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default QCTab;
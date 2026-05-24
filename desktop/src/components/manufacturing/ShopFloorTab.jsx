import { useState, useEffect } from 'react';
import { getWorkOrders, logProduction } from '../../api/tenant/manufacturingApi';
import Button from '../../components/ui/Button';
import SearchableSelect from '../../components/ui/SearchableSelect';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Card from '../../components/ui/Card';
import { Hammer } from 'lucide-react';

const ShopFloorTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWO, setSelectedWO] = useState('');
  const [outputQty, setOutputQty] = useState(0);
  const [scrapQty, setScrapQty] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getWorkOrders().then(res => setOrders((res.data.data || []).filter(o => o.status !== 'completed' && o.status !== 'cancelled'))).finally(() => setLoading(false));
  }, []);

  const handleLog = async () => {
    if (!selectedWO) return;
    setSaving(true);
    try {
      await logProduction({ workOrderId: selectedWO, outputQty, scrapQty });
      setMessage({ type: 'success', text: 'Production logged.' });
      setSelectedWO(''); setOutputQty(0); setScrapQty(0);
      getWorkOrders().then(res => setOrders((res.data.data || []).filter(o => o.status !== 'completed' && o.status !== 'cancelled')));
    } catch { setMessage({ type: 'error', text: 'Failed.' }); } finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-lg">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4"><Hammer size={18} className="inline mr-1" /> Shop Floor Terminal</h2>
        {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}
        <div className="space-y-3">
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Work Order</label><SearchableSelect options={orders.map(o => ({ value: o._id, label: `${o.orderNumber} — ${o.product?.name || 'N/A'} (Qty: ${o.quantity})` }))} value={selectedWO} onChange={setSelectedWO} placeholder="Select WO" /></div>
          <div className="grid grid-cols-2 gap-2"><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Output Quantity</label><Input type="number" value={outputQty} onChange={e => setOutputQty(parseInt(e.target.value) || 0)} /></div><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Scrap Quantity</label><Input type="number" value={scrapQty} onChange={e => setScrapQty(parseInt(e.target.value) || 0)} /></div></div>
          <Button onClick={handleLog} disabled={saving} className="w-full">{saving ? 'Logging...' : 'Log Production'}</Button>
        </div>
      </Card>
    </div>
  );
};

export default ShopFloorTab;
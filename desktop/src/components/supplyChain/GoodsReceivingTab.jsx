import { useState, useEffect } from 'react';
import { getPurchaseOrders, receiveGoods } from '../../api/tenant/supplyChainApi';
import { getWarehouses } from '../../api/tenant/inventoryApi';
import Button from '../../components/ui/Button';
import SearchableSelect from '../../components/ui/SearchableSelect';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Card from '../../components/ui/Card';
import { Package } from 'lucide-react';

const GoodsReceivingTab = () => {
  const [orders, setOrders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPO, setSelectedPO] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [quantities, setQuantities] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([
      getPurchaseOrders(),
      getWarehouses()
    ]).then(([oRes, wRes]) => {
      setOrders((oRes.data.data || []).filter(o => o.status !== 'delivered' && o.status !== 'cancelled'));
      setWarehouses(wRes.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const po = orders.find(o => o._id === selectedPO);

  const handleReceive = async () => {
    if (!selectedPO) return setMessage({ type: 'error', text: 'Select a purchase order.' });
    if (!warehouse) return setMessage({ type: 'error', text: 'Select a warehouse.' });
    setSaving(true);
    setMessage('');
    try {
      await receiveGoods({ purchaseOrderId: selectedPO, warehouse, quantities });
      setMessage({ type: 'success', text: 'Goods received! Stock updated.' });
      setSelectedPO('');
      setWarehouse('');
      setQuantities({});
      getPurchaseOrders().then(res => setOrders((res.data.data || []).filter(o => o.status !== 'delivered')));
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to receive goods.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-lg">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Receive Goods</h2>
        {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Purchase Order *</label>
            <SearchableSelect
              options={orders.map(o => ({ value: o._id, label: `${o.orderNumber} — ${o.supplier?.companyName || 'N/A'}` }))}
              value={selectedPO}
              onChange={val => { setSelectedPO(val); setQuantities({}); }}
              placeholder="Select PO"
            />
          </div>
          {po && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Warehouse *</label>
                <SearchableSelect
                  options={warehouses.map(w => ({ value: w._id, label: w.name }))}
                  value={warehouse}
                  onChange={setWarehouse}
                  placeholder="Select warehouse"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Received Quantities</label>
                {po.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">{item.description || item.product?.name || 'Item'}</span>
                    <span className="text-xs text-gray-500">Ordered: {item.quantity}</span>
                    <Input
                      type="number"
                      placeholder="0"
                      value={quantities[idx] || ''}
                      onChange={e => setQuantities(prev => ({ ...prev, [idx]: parseInt(e.target.value) || 0 }))}
                      className="w-16"
                    />
                  </div>
                ))}
              </div>
              <Button onClick={handleReceive} disabled={saving} className="w-full">
                <Package size={14} className="mr-1" /> {saving ? 'Receiving...' : 'Receive Goods'}
              </Button>
            </>
          )}
          {!po && orders.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">No pending purchase orders.</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default GoodsReceivingTab;
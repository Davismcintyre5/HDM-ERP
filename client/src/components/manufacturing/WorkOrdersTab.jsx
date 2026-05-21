import { useState, useEffect } from 'react';
import { getWorkOrders, createWorkOrder, updateWorkOrderStatus } from '../../api/tenant/manufacturingApi';
import { getProducts } from '../../api/tenant/productsApi';
import { getBOMs } from '../../api/tenant/manufacturingApi';
import Button from '../../components/ui/Button';
import SearchableSelect from '../../components/ui/SearchableSelect';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Plus, ArrowRight, Eye, Printer, Trash2, CheckCircle, RefreshCw, Package } from 'lucide-react';
import formatDate from '../../utils/formatDate';
import { printDetail } from '../../utils/printUtils';
import api from '../../api/axios';

const statusFlow = ['draft', 'confirmed', 'processing', 'completed'];
const statusColors = { draft: 'default', confirmed: 'info', processing: 'warning', completed: 'success', cancelled: 'danger' };

const WorkOrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewWO, setViewWO] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ product: '', quantity: 1, scheduledStart: '', scheduledEnd: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getWorkOrders(), getProducts(), getBOMs()])
      .then(([wRes, pRes, bRes]) => { setOrders(wRes.data.data || []); setProducts(pRes.data.data || []); setBoms(bRes.data.data || []); })
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault(); if (!form.product) return;
    setSaving(true);
    try { await createWorkOrder(form); setShowForm(false); setForm({ product: '', quantity: 1, scheduledStart: '', scheduledEnd: '' }); refreshOrders(); setMessage({ type: 'success', text: 'Work order created.' }); }
    catch { setMessage({ type: 'error', text: 'Failed.' }); } finally { setSaving(false); }
  };

  const advanceStatus = async (id, status) => {
    try { await updateWorkOrderStatus(id, status); refreshOrders(); setMessage({ type: 'success', text: `Status: ${status}` }); }
    catch { setMessage({ type: 'error', text: 'Failed.' }); }
  };

  const handleAddToInventory = async (wo) => {
    try {
      await api.post('/tenant/manufacturing/shop-floor', { workOrderId: wo._id, outputQty: wo.quantity, scrapQty: 0 });
      setMessage({ type: 'success', text: 'Production added to inventory.' });
      refreshOrders();
    } catch { setMessage({ type: 'error', text: 'Failed.' }); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/tenant/manufacturing/work-orders/${deleteId}`); setDeleteId(null); refreshOrders(); }
    catch { setMessage({ type: 'error', text: 'Failed.' }); }
  };

  const refreshOrders = () => getWorkOrders().then(res => setOrders(res.data.data || []));

  const handlePrint = (wo) => {
    printDetail({
      'WO Number': wo.orderNumber,
      Product: wo.product?.name || 'N/A',
      Quantity: wo.quantity,
      'Scheduled Start': formatDate(wo.scheduledStart),
      'Scheduled End': formatDate(wo.scheduledEnd),
      Status: wo.status,
      'Output Qty': wo.outputQuantity || 0,
      'Scrap Qty': wo.scrapQuantity || 0,
      'QC Status': wo.qualityStatus || 'Pending',
    }, { title: `Work Order: ${wo.orderNumber}` });
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4"><p className="text-sm text-gray-500 dark:text-gray-400">{orders.length} orders</p><Button size="sm" onClick={() => setShowForm(true)}><Plus size={14} className="mr-1" /> New WO</Button></div>
      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200 dark:border-gray-700"><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">WO #</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Product</th><th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Qty</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Start</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">End</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th><th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Output</th><th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Actions</th></tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o._id} className="border-b border-gray-100 dark:border-gray-700/50">
                <td className="py-2 font-medium text-gray-900 dark:text-white">{o.orderNumber}</td>
                <td className="py-2 text-gray-600 dark:text-gray-400">{o.product?.name || 'N/A'}</td>
                <td className="py-2 text-right text-gray-700 dark:text-gray-300">{o.quantity}</td>
                <td className="py-2 text-xs text-gray-500 dark:text-gray-400">{formatDate(o.scheduledStart)}</td>
                <td className="py-2 text-xs text-gray-500 dark:text-gray-400">{formatDate(o.scheduledEnd)}</td>
                <td className="py-2"><Badge variant={statusColors[o.status] || 'default'}>{o.status}</Badge></td>
                <td className="py-2 text-right text-primary-500 dark:text-primary-400 font-medium">{o.outputQuantity || 0}</td>
                <td className="py-2">
                  <div className="flex items-center justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setViewWO(o)} title="View"><Eye size={12} /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handlePrint(o)} title="Print"><Printer size={12} /></Button>

                    {o.status === 'completed' ? (
                      <>
                        {o.qualityStatus === 'passed' ? (
                          <Badge variant="success"><CheckCircle size={10} className="mr-0.5" /> Passed</Badge>
                        ) : o.qualityStatus === 'failed' ? (
                          <Button size="sm" variant="ghost" className="text-amber-500" onClick={() => advanceStatus(o._id, 'processing')} title="Rework"><RefreshCw size={12} /></Button>
                        ) : (
                          <Button size="sm" variant="ghost" className="text-primary-500" onClick={() => handleAddToInventory(o)} title="Add to Inventory"><Package size={12} /></Button>
                        )}
                      </>
                    ) : (
                      o.status !== 'cancelled' && (
                        <Button size="sm" variant="ghost" onClick={() => advanceStatus(o._id, statusFlow[statusFlow.indexOf(o.status) + 1])} title="Next">
                          <ArrowRight size={14} />
                        </Button>
                      )
                    )}
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => setDeleteId(o._id)} title="Delete"><Trash2 size={12} /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Work Order">
        <form onSubmit={handleCreate} className="space-y-3">
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Product *</label><SearchableSelect options={products.map(p => ({ value: p._id, label: p.name }))} value={form.product} onChange={val => setForm(prev => ({ ...prev, product: val }))} placeholder="Select product" /></div>
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Quantity</label><Input type="number" value={form.quantity} onChange={e => setForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))} /></div>
          <div className="grid grid-cols-2 gap-2"><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Start</label><Input type="date" value={form.scheduledStart} onChange={e => setForm(prev => ({ ...prev, scheduledStart: e.target.value }))} /></div><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">End</label><Input type="date" value={form.scheduledEnd} onChange={e => setForm(prev => ({ ...prev, scheduledEnd: e.target.value }))} /></div></div>
          <div className="flex gap-2"><Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button><Button type="submit" disabled={saving} className="flex-1">Create</Button></div>
        </form>
      </Modal>

      {/* View Modal */}
      {viewWO && (
        <Modal open={!!viewWO} onClose={() => setViewWO(null)} title={`Work Order: ${viewWO.orderNumber}`}>
          <div className="space-y-3 text-sm max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-gray-500 text-xs">Product</span><p className="font-medium text-gray-900 dark:text-white">{viewWO.product?.name || 'N/A'}</p></div>
              <div><span className="text-gray-500 text-xs">Quantity</span><p className="text-gray-900 dark:text-white">{viewWO.quantity}</p></div>
              <div><span className="text-gray-500 text-xs">Start</span><p className="text-gray-900 dark:text-white">{formatDate(viewWO.scheduledStart)}</p></div>
              <div><span className="text-gray-500 text-xs">End</span><p className="text-gray-900 dark:text-white">{formatDate(viewWO.scheduledEnd)}</p></div>
              <div><span className="text-gray-500 text-xs">Status</span><p><Badge variant={statusColors[viewWO.status]}>{viewWO.status}</Badge></p></div>
              <div><span className="text-gray-500 text-xs">QC</span><p className="text-gray-900 dark:text-white">{viewWO.qualityStatus || 'Pending'}</p></div>
              <div><span className="text-gray-500 text-xs">Output</span><p className="text-primary-500 font-medium">{viewWO.outputQuantity || 0}</p></div>
              <div><span className="text-gray-500 text-xs">Scrap</span><p className="text-red-500">{viewWO.scrapQuantity || 0}</p></div>
            </div>
            {viewWO.bom && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">BOM Components</h4>
                {(boms.find(b => b._id === (viewWO.bom?._id || viewWO.bom))?.components || []).map((c, i) => (
                  <p key={i} className="text-xs text-gray-500">• {c.product?.name || 'Component'} — {c.quantity} {c.unit}</p>
                ))}
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => handlePrint(viewWO)}><Printer size={14} className="mr-1" /> Print</Button>
              {viewWO.status === 'completed' && !viewWO.qualityStatus && (
                <Button size="sm" onClick={() => handleAddToInventory(viewWO)}><Package size={14} className="mr-1" /> Add to Inventory</Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => setViewWO(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Work Order" message="Are you sure?" />
    </div>
  );
};

export default WorkOrdersTab;
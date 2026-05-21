import { useState, useEffect } from 'react';
import { getUnifiedOrders } from '../../api/tenant/ordersApi';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Select from '../../components/ui/Select';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';

const statusColors = { draft: 'default', confirmed: 'info', processing: 'warning', shipped: 'info', delivered: 'success', invoiced: 'info', paid: 'success', cancelled: 'danger', completed: 'success', pending: 'warning' };

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    getUnifiedOrders().then(res => setOrders(res.data.data || [])).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.orderType === filter);

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{orders.length} total</p>
        </div>
        <Select value={filter} onChange={e => setFilter(e.target.value)} className="w-40">
          <option value="all">All Orders</option>
          <option value="sales">Sales</option>
          <option value="purchase">Purchase</option>
          <option value="work">Work</option>
        </Select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200 dark:border-gray-700"><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Order #</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Type</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Customer/Supplier</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Date</th><th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Total</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th></tr></thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o._id} className="border-b border-gray-100 dark:border-gray-700/50">
                <td className="py-2 font-medium text-gray-900 dark:text-white">{o.orderNumber}</td>
                <td className="py-2"><Badge variant={o.orderType === 'sales' ? 'info' : o.orderType === 'purchase' ? 'warning' : 'success'}>{o.orderType}</Badge></td>
                <td className="py-2 text-gray-600 dark:text-gray-400">{o.customer?.companyName || o.supplier?.companyName || o.product?.name || 'N/A'}</td>
                <td className="py-2 text-gray-500 dark:text-gray-400 text-xs">{formatDate(o.orderDate || o.createdAt)}</td>
                <td className="py-2 text-right text-primary-500 dark:text-primary-400 font-medium">{formatCurrency(o.grandTotal || 0)}</td>
                <td className="py-2"><Badge variant={statusColors[o.status] || 'default'}>{o.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersPage;
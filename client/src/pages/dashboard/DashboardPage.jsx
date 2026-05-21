import { useEffect, useState } from 'react';
import { getMetrics } from '../../api/tenant/dashboardApi';
import { useTenant } from '../../context/TenantContext';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import { TrendingUp, TrendingDown, Users, FileText, Package } from 'lucide-react';

const DashboardPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { tenant } = useTenant();

  useEffect(() => {
    getMetrics()
      .then(res => setMetrics(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  const stats = [
    { label: 'Total Customers', value: metrics?.totalCustomers || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Open Invoices', value: metrics?.openInvoices?.count || 0, icon: FileText, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', sub: `KSh ${(metrics?.openInvoices?.total || 0).toLocaleString()}` },
    { label: 'Revenue', value: `KSh ${(metrics?.revenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Low Stock Items', value: metrics?.lowStockItems || 0, icon: Package, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
    { label: 'Income', value: `KSh ${(metrics?.cashFlow?.income || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Expenses', value: `KSh ${(metrics?.cashFlow?.expenses || 0).toLocaleString()}`, icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, {tenant?.companyName || 'Company'}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bg}`}><stat.icon size={20} className={stat.color} /></div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                {stat.sub && <p className="text-xs text-gray-500">{stat.sub}</p>}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!metrics?.totalCustomers && !metrics?.recentOrders?.length ? (
        <div className="text-center py-16 text-gray-400">
          <Package size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg">No data yet</p>
          <p className="text-sm">Start by adding customers, products, or creating invoices.</p>
        </div>
      ) : (
        metrics?.recentOrders?.length > 0 && (
          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Recent Orders</h3>
            <div className="space-y-2">
              {metrics.recentOrders.slice(0, 5).map((order) => (
                <div key={order._id} className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-gray-700 pb-2">
                  <div><span className="font-medium text-gray-700 dark:text-gray-300">{order.orderNumber}</span><span className="ml-2 text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span></div>
                  <span className="text-gray-600 dark:text-gray-400">KSh {order.grandTotal?.toLocaleString() || 0}</span>
                </div>
              ))}
            </div>
          </Card>
        )
      )}
    </div>
  );
};

export default DashboardPage;
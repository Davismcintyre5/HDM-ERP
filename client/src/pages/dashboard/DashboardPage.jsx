import { useEffect, useState, useRef } from 'react';
import { getMetrics } from '../../api/tenant/dashboardApi';
import { useTenant } from '../../context/TenantContext';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, Users, FileText, Package, AlertTriangle,
  DollarSign, ShoppingCart, ArrowRight, Sparkles, Plus, Clock
} from 'lucide-react';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';

const DashboardPage = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { tenant } = useTenant();
  const navigate = useNavigate();

  useEffect(() => {
    getMetrics()
      .then(res => setMetrics(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  const stats = [
    {
      label: 'Total Revenue',
      value: formatCurrency(metrics?.revenue || 0),
      icon: DollarSign,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      trend: metrics?.revenue > 0 ? 'up' : null,
    },
    {
      label: 'Open Invoices',
      value: metrics?.openInvoices?.count || 0,
      sub: formatCurrency(metrics?.openInvoices?.total || 0),
      icon: FileText,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      trend: metrics?.openInvoices?.count > 0 ? 'warning' : null,
    },
    {
      label: 'Total Customers',
      value: metrics?.totalCustomers || 0,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      label: 'Low Stock Items',
      value: metrics?.lowStockItems || 0,
      icon: AlertTriangle,
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-900/20',
      trend: metrics?.lowStockItems > 0 ? 'danger' : null,
    },
  ];

  const quickActions = [
    { label: 'New Invoice', icon: Plus, path: '/finance/invoices', color: 'bg-primary-500 hover:bg-primary-600' },
    { label: 'New Order', icon: ShoppingCart, path: '/sales/orders', color: 'bg-blue-500 hover:bg-blue-600' },
    { label: 'Add Product', icon: Package, path: '/products', color: 'bg-amber-500 hover:bg-amber-600' },
    { label: 'Add Customer', icon: Users, path: '/contacts', color: 'bg-purple-500 hover:bg-purple-600' },
  ];

  // Revenue vs Expenses bar chart data
  const income = metrics?.cashFlow?.income || 0;
  const expenses = metrics?.cashFlow?.expenses || 0;
  const maxBar = Math.max(income, expenses, 1);
  const incomePercent = (income / maxBar) * 100;
  const expensePercent = (expenses / maxBar) * 100;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {tenant?.companyName || 'Company'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                <stat.icon size={22} className={stat.color} />
              </div>
              {stat.trend === 'up' && <TrendingUp size={16} className="text-emerald-500" />}
              {stat.trend === 'warning' && <AlertTriangle size={16} className="text-amber-500" />}
              {stat.trend === 'danger' && <AlertTriangle size={16} className="text-red-500" />}
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-3">{stat.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
            {stat.sub && <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>}
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className={`${action.color} text-white p-3 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors`}
              >
                <action.icon size={16} />
                {action.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Cash Flow Chart */}
        <Card className="p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Cash Flow</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Income</span>
                <span className="font-medium text-emerald-500">{formatCurrency(income)}</span>
              </div>
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${incomePercent}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Expenses</span>
                <span className="font-medium text-red-500">{formatCurrency(expenses)}</span>
              </div>
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${expensePercent}%` }} />
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Net</span>
              <span className={`text-sm font-bold ${income - expenses >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {formatCurrency(income - expenses)}
              </span>
            </div>
          </div>
        </Card>

        {/* AI Insights */}
        <Card className="p-5 bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/20 dark:to-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-primary-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">AI Insights</h3>
          </div>
          <div className="space-y-3 text-sm">
            {metrics?.lowStockItems > 0 && (
              <p className="text-gray-600 dark:text-gray-400">
                ⚠️ You have <strong className="text-red-500">{metrics.lowStockItems} items</strong> running low on stock.
              </p>
            )}
            {metrics?.openInvoices?.count > 0 && (
              <p className="text-gray-600 dark:text-gray-400">
                📋 <strong className="text-amber-500">{metrics.openInvoices.count} invoices</strong> pending — {formatCurrency(metrics.openInvoices.total)}.
              </p>
            )}
            {income > expenses && (
              <p className="text-gray-600 dark:text-gray-400">
                📈 Your income exceeds expenses by <strong className="text-emerald-500">{formatCurrency(income - expenses)}</strong>.
              </p>
            )}
            {!metrics?.lowStockItems && !metrics?.openInvoices?.count && income === 0 && (
              <p className="text-gray-400 text-xs">Start adding data to get AI-powered insights.</p>
            )}
          </div>
          <button onClick={() => navigate('/finance/reports')} className="flex items-center gap-1 text-xs text-primary-500 hover:underline mt-3">
            View full reports <ArrowRight size={12} />
          </button>
        </Card>
      </div>

      {/* Recent Orders */}
      {metrics?.recentOrders?.length > 0 && (
        <Card className="p-5 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Orders</h3>
            <button onClick={() => navigate('/orders')} className="text-xs text-primary-500 hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-xs text-gray-500">
                  <th className="pb-2">Order #</th><th className="pb-2">Customer</th><th className="pb-2">Date</th><th className="pb-2 text-right">Amount</th><th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentOrders.slice(0, 5).map((order) => (
                  <tr key={order._id} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="py-2 font-medium text-gray-900 dark:text-white">{order.orderNumber}</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">{order.customer?.companyName || order.customerName || 'N/A'}</td>
                    <td className="py-2 text-gray-500 text-xs">{formatDate(order.orderDate || order.createdAt)}</td>
                    <td className="py-2 text-right font-medium">{formatCurrency(order.grandTotal || 0)}</td>
                    <td className="py-2"><Badge variant={order.status === 'paid' ? 'success' : order.status === 'cancelled' ? 'danger' : 'info'}>{order.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!metrics?.totalCustomers && !metrics?.recentOrders?.length && (
        <div className="text-center py-16 text-gray-400 mt-6">
          <Package size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Welcome to HDM ERP!</p>
          <p className="text-sm mt-1">Get started by adding customers, products, or creating your first invoice.</p>
          <div className="flex justify-center gap-3 mt-6">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className={`${action.color} text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2`}
              >
                <action.icon size={14} /> {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
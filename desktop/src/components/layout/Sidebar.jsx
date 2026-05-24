import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import { useTenant } from '../../context/TenantContext';
import { useTheme } from '../../context/ThemeContext';
import clsx from 'clsx';
import {
  LayoutDashboard, Banknote, Users, ShoppingCart, Package, Truck, Factory, ClipboardList,
  Contact, Box, BarChart3, Settings, Sun, Moon, ChevronLeft, ChevronRight, X
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', module: 'dashboard' },
  { to: '/finance/accounts', icon: Banknote, label: 'Finance', module: 'finance' },
  { to: '/hr/employees', icon: Users, label: 'HR', module: 'hr' },
  { to: '/sales/orders', icon: ShoppingCart, label: 'Sales', module: 'sales' },
  { to: '/inventory/stock', icon: Package, label: 'Inventory', module: 'inventory' },
  { to: '/supply-chain/purchase-orders', icon: Truck, label: 'Supply Chain', module: 'supplyChain' },
  { to: '/orders', icon: ClipboardList, label: 'Orders', module: 'orders' },
  { to: '/manufacturing/boms', icon: Factory, label: 'Manufacturing', module: 'manufacturing' },
  { to: '/contacts', icon: Contact, label: 'Contacts', module: 'contacts' },
  { to: '/products', icon: Box, label: 'Products', module: 'products' },
  { to: '/reports', icon: BarChart3, label: 'Reports', module: 'reports' },
  { to: '/settings/company', icon: Settings, label: 'Settings', module: 'settings' },
];

const Sidebar = () => {
  const { collapsed, toggle, mobileOpen, toggleMobile } = useSidebar();
  const { modules, tenant } = useTenant();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const filtered = navItems.filter((item) => modules[item.module] !== false);

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={toggleMobile} />}
      <aside className={clsx(
        'fixed md:static inset-y-0 left-0 z-40 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300',
        mobileOpen ? 'w-60' : collapsed ? 'w-16' : 'w-60',
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}>
        {/* Brand Header */}
        <div className="h-14 flex items-center justify-between px-3 border-b border-gray-200 dark:border-gray-800">
          <div className="overflow-hidden">
            {(!collapsed || mobileOpen) && (
              <>
                <span className="text-lg font-bold text-primary-500 block leading-tight">HDM ERP</span>
                {tenant?.companyName && (
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 block leading-tight truncate">{tenant.companyName}</span>
                )}
              </>
            )}
          </div>
          <button onClick={toggle} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 hidden md:block">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <button onClick={toggleMobile} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden">
            <X size={16} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
          {filtered.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => mobileOpen && toggleMobile()}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to))
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
            >
              <Icon size={18} />
              {(!collapsed || mobileOpen) && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        {/* Theme Toggle */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-800">
          <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            {(!collapsed || mobileOpen) && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
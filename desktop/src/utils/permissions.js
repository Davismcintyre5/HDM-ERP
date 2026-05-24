const rolePermissions = {
  company_admin: ['all'],
  accountant: ['finance', 'reports', 'dashboard'],
  hr_manager: ['hr', 'dashboard'],
  sales_manager: ['sales', 'contacts', 'products', 'dashboard'],
  inventory_manager: ['inventory', 'supplyChain', 'products', 'dashboard'],
  staff: ['dashboard'],
};

export const hasPermission = (userRole, module) => {
  if (!userRole || !module) return false;
  const perms = rolePermissions[userRole] || [];
  if (perms.includes('all')) return true;
  return perms.includes(module);
};
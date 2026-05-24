import { useState, useEffect } from 'react';
import { getUsers, inviteUser, updateUser, deleteUser } from '../../api/tenant/usersApi';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { UserPlus, Trash2, Users } from 'lucide-react';

const roles = [
  { value: 'company_admin', label: 'Company Admin' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'hr_manager', label: 'HR Manager' },
  { value: 'sales_manager', label: 'Sales Manager' },
  { value: 'inventory_manager', label: 'Inventory Manager' },
  { value: 'staff', label: 'Staff' },
];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', firstName: '', lastName: '', password: '', role: 'staff' });
  const [message, setMessage] = useState('');
  const [deleteId, setDeleteId] = useState(null);

  const fetchUsers = () => {
    getUsers()
      .then(res => setUsers(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteForm.email || !inviteForm.firstName || !inviteForm.lastName || !inviteForm.password) {
      return setMessage({ type: 'error', text: 'All fields are required.' });
    }
    try {
      await inviteUser(inviteForm);
      setMessage({ type: 'success', text: `User ${inviteForm.email} created successfully.` });
      setShowInvite(false);
      setInviteForm({ email: '', firstName: '', lastName: '', password: '', role: 'staff' });
      fetchUsers();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create user.' });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(deleteId);
      setMessage({ type: 'success', text: 'User deleted.' });
      setDeleteId(null);
      fetchUsers();
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete.' });
    }
  };

  const getRoleBadge = (role) => {
    const r = roles.find(rl => rl.value === role);
    return r?.label || role;
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <Card className="p-6 max-w-3xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Users</h2>
        <Button size="sm" onClick={() => { setShowInvite(true); setMessage(''); }}>
          <UserPlus size={14} className="mr-1" /> Add User
        </Button>
      </div>

      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}

      {users.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <Users size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No users yet</p>
          <p className="text-xs">Add staff members to your company.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium text-xs">Name</th>
                <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium text-xs">Email</th>
                <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium text-xs">Role</th>
                <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium text-xs">Status</th>
                <th className="text-right py-2 text-gray-500 dark:text-gray-400 font-medium text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-b border-gray-100 dark:border-gray-700/50">
                  <td className="py-2 text-gray-900 dark:text-gray-100 font-medium">{u.firstName} {u.lastName}</td>
                  <td className="py-2 text-gray-500 dark:text-gray-400">{u.email}</td>
                  <td className="py-2"><Badge variant={u.role === 'company_admin' ? 'success' : 'info'}>{getRoleBadge(u.role)}</Badge></td>
                  <td className="py-2">
                    <Badge variant={u.isActive !== false ? 'success' : 'danger'}>
                      {u.isActive !== false ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => setDeleteId(u._id)}
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Add User">
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
              <Input
                placeholder="John"
                value={inviteForm.firstName}
                onChange={e => setInviteForm({ ...inviteForm, firstName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
              <Input
                placeholder="Doe"
                value={inviteForm.lastName}
                onChange={e => setInviteForm({ ...inviteForm, lastName: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
            <Input
              type="email"
              placeholder="john@company.com"
              value={inviteForm.email}
              onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password *</label>
            <Input
              type="password"
              placeholder="Set a password"
              value={inviteForm.password}
              onChange={e => setInviteForm({ ...inviteForm, password: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role *</label>
            <Select
              value={inviteForm.role}
              onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })}
            >
              {roles.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </Select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowInvite(false)} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1">Create User</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />
    </Card>
  );
};

export default UserManagement;
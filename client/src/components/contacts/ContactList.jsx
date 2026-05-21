import { useState } from 'react';
import { deleteContact } from '../../api/tenant/contactsApi';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import ConfirmDialog from '../ui/ConfirmDialog';
import { Users, Edit3, Trash2 } from 'lucide-react';
import Button from '../ui/Button';

const typeBadges = { customer: 'info', supplier: 'warning', partner: 'success' };

const ContactList = ({ contacts, search, filterType, onEdit, onRefresh, onMessage }) => {
  const [deleteId, setDeleteId] = useState(null);

  const filtered = contacts.filter(c => {
    const match = !search || c.companyName?.toLowerCase().includes(search.toLowerCase()) || c.contactPerson?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase());
    const typeMatch = filterType === 'all' || c.type === filterType;
    return match && typeMatch;
  });

  const handleDelete = async () => {
    try { await deleteContact(deleteId); setDeleteId(null); onRefresh(); onMessage({ type: 'success', text: 'Contact deleted.' }); }
    catch { onMessage({ type: 'error', text: 'Failed to delete.' }); }
  };

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Users size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-lg">No contacts found</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <Card key={c._id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{c.companyName || 'N/A'}</h3>
                {c.contactPerson && <p className="text-sm text-gray-500 dark:text-gray-400">{c.contactPerson}</p>}
              </div>
              <Badge variant={typeBadges[c.type] || 'default'}>{c.type}</Badge>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              {c.email && <p>📧 {c.email}</p>}
              {c.phone && <p>📞 {c.phone}</p>}
              {c.address?.city && <p>📍 {c.address.city}{c.address.country ? `, ${c.address.country}` : ''}</p>}
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <Button size="sm" variant="ghost" onClick={() => onEdit(c)}><Edit3 size={12} className="mr-1" /> Edit</Button>
              <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => setDeleteId(c._id)}><Trash2 size={12} className="mr-1" /> Delete</Button>
            </div>
          </Card>
        ))}
      </div>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Contact" message="Are you sure?" />
    </>
  );
};

export default ContactList;
import { useState, useEffect } from 'react';
import { getContacts } from '../../api/tenant/contactsApi';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import { Plus } from 'lucide-react';
import ContactSearch from '../../components/contacts/ContactSearch';
import ContactList from '../../components/contacts/ContactList';
import ContactForm from '../../components/contacts/ContactForm';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'customer', label: 'Customers' },
  { key: 'supplier', label: 'Suppliers' },
  { key: 'partner', label: 'Partners' },
];

const ContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [message, setMessage] = useState('');

  const fetchContacts = () => {
    getContacts()
      .then(res => setContacts(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchContacts(); }, []);

  const handleAdd = () => { setEditContact(null); setShowForm(true); setMessage(''); };
  const handleEdit = (c) => { setEditContact(c); setShowForm(true); setMessage(''); };
  const handleSaved = () => { setShowForm(false); fetchContacts(); };

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contacts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{contacts.length} total</p>
        </div>
        <Button onClick={handleAdd}><Plus size={16} className="mr-1" /> Add Contact</Button>
      </div>

      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ContactSearch search={search} onSearch={setSearch} />
      <ContactList
        contacts={contacts}
        search={search}
        filterType={activeTab}
        onEdit={handleEdit}
        onRefresh={fetchContacts}
        onMessage={setMessage}
      />

      {showForm && (
        <ContactForm contact={editContact} onClose={() => setShowForm(false)} onSaved={handleSaved} />
      )}
    </div>
  );
};

export default ContactsPage;
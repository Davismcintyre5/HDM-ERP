import Input from '../ui/Input';
import { Search } from 'lucide-react';

const ContactSearch = ({ search, onSearch }) => (
  <div className="relative max-w-xs mb-4">
    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
    <Input className="pl-9" placeholder="Search contacts..." value={search} onChange={e => onSearch(e.target.value)} />
  </div>
);

export default ContactSearch;
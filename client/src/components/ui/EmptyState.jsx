import { PackageOpen } from 'lucide-react';

const EmptyState = ({ title = 'No data', description = '', icon: Icon = PackageOpen }) => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
    <Icon size={48} className="mb-4" />
    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">{title}</h3>
    {description && <p className="text-sm mt-1">{description}</p>}
  </div>
);
export default EmptyState;
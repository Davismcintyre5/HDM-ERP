import { ChevronRight } from 'lucide-react';

const Breadcrumb = ({ items }) => (
  <nav className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
    {items.map((item, idx) => (
      <span key={idx} className="flex items-center gap-1">
        {idx > 0 && <ChevronRight size={14} />}
        {idx === items.length - 1 ? (
          <span className="text-gray-900 dark:text-white font-medium">{item.label}</span>
        ) : (
          <a href={item.href} className="hover:text-primary-500">{item.label}</a>
        )}
      </span>
    ))}
  </nav>
);
export default Breadcrumb;
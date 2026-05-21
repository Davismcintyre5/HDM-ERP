import clsx from 'clsx';

const Tabs = ({ tabs, active, onChange }) => (
  <div className="flex border-b border-gray-200 dark:border-gray-700">
    {tabs.map((tab) => (
      <button
        key={tab.value}
        onClick={() => onChange(tab.value)}
        className={clsx(
          'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
          active === tab.value
            ? 'border-primary-500 text-primary-500'
            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        )}
      >
        {tab.label}
      </button>
    ))}
  </div>
);
export default Tabs;
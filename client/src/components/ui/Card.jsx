import clsx from 'clsx';

const Card = ({ className, children }) => (
  <div className={clsx('bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700', className)}>
    {children}
  </div>
);
export default Card;
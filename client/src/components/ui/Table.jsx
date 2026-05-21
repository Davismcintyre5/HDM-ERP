import clsx from 'clsx';

const Table = ({ className, children }) => (
  <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
    <table className={clsx('w-full text-sm text-left', className)}>
      {children}
    </table>
  </div>
);

const Th = ({ className, children }) => (
  <th className={clsx('px-4 py-3 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 font-medium', className)}>
    {children}
  </th>
);

const Td = ({ className, children }) => (
  <td className={clsx('px-4 py-3 border-t border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300', className)}>
    {children}
  </td>
);

Table.Th = Th;
Table.Td = Td;
export default Table;
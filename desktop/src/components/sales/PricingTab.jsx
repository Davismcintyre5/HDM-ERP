import { useState, useEffect } from 'react';
import { getPricing, updatePrice } from '../../api/tenant/salesApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import formatCurrency from '../../utils/formatCurrency';

const PricingTab = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getPricing().then(res => setProducts(res.data.data || [])).finally(() => setLoading(false));
  }, []);

  const handleSave = async (id) => {
    try {
      await updatePrice(id, editPrice);
      setEditingId(null);
      getPricing().then(res => setProducts(res.data.data || []));
      setMessage({ type: 'success', text: 'Price updated.' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update.' });
    }
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <div>
      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Product</th>
              <th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">SKU</th>
              <th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Cost</th>
              <th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Selling</th>
              <th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Margin</th>
              <th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id} className="border-b border-gray-100 dark:border-gray-700/50">
                <td className="py-2 font-medium text-gray-900 dark:text-white">{p.name}</td>
                <td className="py-2 text-xs font-mono text-gray-500 dark:text-gray-400">{p.sku || '—'}</td>
                <td className="py-2 text-gray-600 dark:text-gray-400">{formatCurrency(p.costPrice)}</td>
                <td className="py-2 text-primary-500 dark:text-primary-400 font-medium">
                  {editingId === p._id ? (
                    <Input type="number" step="0.01" value={editPrice} onChange={e => setEditPrice(parseFloat(e.target.value))} className="w-24" />
                  ) : (
                    formatCurrency(p.sellingPrice)
                  )}
                </td>
                <td className="py-2 text-xs text-gray-500 dark:text-gray-400">
                  {p.costPrice ? Math.round((p.sellingPrice - p.costPrice) / p.costPrice * 100) : 0}%
                </td>
                <td className="py-2 text-right">
                  {editingId === p._id ? (
                    <Button size="sm" onClick={() => handleSave(p._id)}>Save</Button>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => { setEditingId(p._id); setEditPrice(p.sellingPrice); }}>Edit Price</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PricingTab;
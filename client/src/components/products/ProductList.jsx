import { useState } from 'react';
import { deleteProduct } from '../../api/tenant/productsApi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Button from '../../components/ui/Button';
import { Box, Edit3, Trash2 } from 'lucide-react';
import formatCurrency from '../../utils/formatCurrency';

const ProductList = ({ products, search, filterCategory, onEdit, onRefresh, onMessage }) => {
  const [deleteId, setDeleteId] = useState(null);

  const filtered = products.filter(p => {
    const match = !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
    const catMatch = filterCategory === 'all' || p.category === filterCategory;
    return match && catMatch;
  });

  const handleDelete = async () => {
    try { await deleteProduct(deleteId); setDeleteId(null); onRefresh(); onMessage({ type: 'success', text: 'Product deleted.' }); }
    catch { onMessage({ type: 'error', text: 'Failed to delete.' }); }
  };

  if (filtered.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Box size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-lg">No products found</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => (
          <Card key={p._id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{p.name}</h3>
                <p className="text-xs text-gray-400 font-mono">{p.sku || 'No SKU'}</p>
              </div>
              <Badge variant={p.type === 'service' ? 'info' : 'default'}>{p.type || 'product'}</Badge>
            </div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Cost</span>
                <span className="text-gray-700 dark:text-gray-300">{formatCurrency(p.costPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Selling</span>
                <span className="text-primary-500 font-medium">{formatCurrency(p.sellingPrice)}</span>
              </div>
              {p.stock !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Stock</span>
                  <span className={`font-medium ${p.stock <= (p.reorderLevel || 0) ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                    {p.stock} {p.unit}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <Button size="sm" variant="ghost" onClick={() => onEdit(p)}><Edit3 size={12} className="mr-1" /> Edit</Button>
              <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => setDeleteId(p._id)}><Trash2 size={12} className="mr-1" /> Delete</Button>
            </div>
          </Card>
        ))}
      </div>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Product" message="Are you sure?" />
    </>
  );
};

export default ProductList;
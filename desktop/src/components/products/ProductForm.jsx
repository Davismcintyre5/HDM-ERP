import { useState, useEffect, useMemo } from 'react';
import { createProduct, updateProduct } from '../../api/tenant/productsApi';
import { getProducts } from '../../api/tenant/productsApi';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

const emptyForm = { name: '', sku: '', category: '', type: 'product', unit: 'piece', costPrice: 0, sellingPrice: 0, reorderLevel: 0, quantity: 0, description: '' };

const ProductForm = ({ product, onClose, onSaved }) => {
  const [form, setForm] = useState(product || emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getProducts().then(res => {
      const cats = [...new Set((res.data.data || []).map(p => p.category).filter(Boolean))];
      setCategories(cats);
    }).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name) return setError('Product name is required.');
    setSaving(true);
    try {
      if (product) await updateProduct(product._id, form);
      else await createProduct(form);
      onSaved();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  return (
    <Modal open onClose={onClose} title={product ? 'Edit Product' : 'Add Product'}>
      {error && <Alert variant="error" message={error} onClose={() => setError('')} />}
      <form onSubmit={handleSave} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Name *</label>
          <Input name="name" placeholder="Product name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">SKU</label>
            <Input name="sku" placeholder="Auto-generated" value={form.sku} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Category</label>
            <div className="relative">
              <Input name="category" placeholder="Type or select" value={form.category} onChange={handleChange} list="categories" />
              <datalist id="categories">
                {categories.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Type</label>
            <Select name="type" value={form.type} onChange={handleChange}>
              <option value="product">Product</option>
              <option value="service">Service</option>
              <option value="raw_material">Raw Material</option>
              <option value="finished_good">Finished Good</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Unit</label>
            <Input name="unit" placeholder="piece, kg" value={form.unit} onChange={handleChange} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Cost</label>
            <Input name="costPrice" type="number" step="0.01" placeholder="0.00" value={form.costPrice} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Selling</label>
            <Input name="sellingPrice" type="number" step="0.01" placeholder="0.00" value={form.sellingPrice} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Qty</label>
            <Input name="quantity" type="number" placeholder="0" value={form.quantity} onChange={handleChange} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Reorder Level</label>
          <Input name="reorderLevel" type="number" placeholder="0" value={form.reorderLevel} onChange={handleChange} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Description</label>
          <Input name="description" placeholder="Short description" value={form.description} onChange={handleChange} />
        </div>
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductForm;
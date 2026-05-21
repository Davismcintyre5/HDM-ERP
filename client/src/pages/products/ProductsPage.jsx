import { useState, useEffect, useMemo } from 'react';
import { getProducts } from '../../api/tenant/productsApi';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import { Plus } from 'lucide-react';
import ProductSearch from '../../components/products/ProductSearch';
import ProductList from '../../components/products/ProductList';
import ProductForm from '../../components/products/ProductForm';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [message, setMessage] = useState('');

  const fetchProducts = () => {
    getProducts()
      .then(res => setProducts(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleAdd = () => { setEditProduct(null); setShowForm(true); setMessage(''); };
  const handleEdit = (p) => { setEditProduct(p); setShowForm(true); setMessage(''); };
  const handleSaved = () => { setShowForm(false); fetchProducts(); };

  const categories = useMemo(() => {
    return [...new Set(products.map(p => p.category).filter(Boolean))];
  }, [products]);

  const tabs = [
    { key: 'all', label: 'All' },
    ...categories.map(c => ({ key: c, label: c })),
  ];

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{products.length} total</p>
        </div>
        <Button onClick={handleAdd}><Plus size={16} className="mr-1" /> Add Product</Button>
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

      <ProductSearch search={search} onSearch={setSearch} />
      <ProductList
        products={products}
        search={search}
        filterCategory={activeTab}
        onEdit={handleEdit}
        onRefresh={fetchProducts}
        onMessage={setMessage}
      />

      {showForm && (
        <ProductForm product={editProduct} onClose={() => setShowForm(false)} onSaved={handleSaved} />
      )}
    </div>
  );
};

export default ProductsPage;
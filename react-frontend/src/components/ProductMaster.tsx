import React, { useState, useEffect } from 'react';
import { PlusIcon, XMarkIcon, EyeIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { io, Socket } from 'socket.io-client';

interface Product {
  _id: string;
  code: string;
  name: string;
  description: string;
  unit: string;
  type: 'finished' | 'raw_material' | 'component';
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  isActive: boolean;
  createdAt: string;
}

const ProductMaster: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    unit: 'pieces',
    type: 'finished' as 'finished' | 'raw_material' | 'component',
    costPrice: 0,
    sellingPrice: 0,
    stockQuantity: 0,
    minStockLevel: 0
  });

  useEffect(() => {
    loadProducts();
    
    const socket: Socket = io('http://localhost:5000');
    socket.on('product_created', loadProducts);
    socket.on('product_updated', loadProducts);
    socket.on('product_deleted', loadProducts);
    
    return () => {
      socket.disconnect();
    };
  }, [typeFilter]);

  const loadProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`http://localhost:5000/api/products?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading products:', error);
      // Mock data for demo
      setProducts([
        {
          _id: '1',
          code: 'PROD-001',
          name: 'Office Chair',
          description: 'Ergonomic office chair with lumbar support',
          unit: 'pieces',
          type: 'finished',
          costPrice: 150.00,
          sellingPrice: 250.00,
          stockQuantity: 45,
          minStockLevel: 10,
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          code: 'RAW-001',
          name: 'Steel Frame',
          description: 'High-grade steel frame for furniture',
          unit: 'kg',
          type: 'raw_material',
          costPrice: 25.50,
          sellingPrice: 0,
          stockQuantity: 5,
          minStockLevel: 20,
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: '3',
          code: 'COMP-001',
          name: 'Desk Surface',
          description: 'Wooden desk surface component',
          unit: 'pieces',
          type: 'component',
          costPrice: 75.00,
          sellingPrice: 0,
          stockQuantity: 30,
          minStockLevel: 15,
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = editingProduct 
        ? `http://localhost:5000/api/products/${editingProduct._id}`
        : 'http://localhost:5000/api/products';
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      setShowModal(false);
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      code: product.code,
      name: product.name,
      description: product.description,
      unit: product.unit,
      type: product.type,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      stockQuantity: product.stockQuantity,
      minStockLevel: product.minStockLevel
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await fetch(`http://localhost:5000/api/products/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      unit: 'pieces',
      type: 'finished',
      costPrice: 0,
      sellingPrice: 0,
      stockQuantity: 0,
      minStockLevel: 0
    });
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Product Master</h1>
        <p className="text-gray-600">Manage finished products, raw materials, and components</p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 w-80"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Types</option>
            <option value="finished">Finished Products</option>
            <option value="raw_material">Raw Materials</option>
            <option value="component">Components</option>
          </select>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{product.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.type === 'finished' ? 'bg-green-100 text-green-800' :
                      product.type === 'raw_material' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {product.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{product.unit}</td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${
                      product.stockQuantity <= product.minStockLevel ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {product.stockQuantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">₹{product.costPrice}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-1 text-teal-600 hover:text-teal-800"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h3>
              <button onClick={() => { setShowModal(false); resetForm(); }}>
                <XMarkIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="finished">Finished Product</option>
                    <option value="raw_material">Raw Material</option>
                    <option value="component">Component</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="pieces">Pieces</option>
                    <option value="kg">Kg</option>
                    <option value="meters">Meters</option>
                    <option value="liters">Liters</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({...formData, costPrice: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({...formData, stockQuantity: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductMaster;
import React, { useState, useEffect } from 'react';
import { productsAPI, stockLedgerAPI } from '../services/api';
import { ArchiveBoxIcon, CurrencyDollarIcon, ExclamationTriangleIcon, ArrowsRightLeftIcon, MagnifyingGlassIcon, PlusIcon, EyeIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { io, Socket } from 'socket.io-client';

interface KPICardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<any>;
  color: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const StockLedger: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [stockMovement, setStockMovement] = useState({ type: 'in', quantity: 0, reason: '' });
  const [kpis, setKpis] = useState({ totalProducts: 0, stockValue: 0, lowStockItems: 0, todayMovements: 0 });

  useEffect(() => {
    loadProducts();
    loadKPIs();
    
    const socket: Socket = io('http://localhost:5000');
    socket.on('stock_updated', loadProducts);
    socket.on('product_updated', loadProducts);
    
    return () => {
      socket.disconnect();
    };
  }, [selectedCategory]);

  const loadProducts = async () => {
    try {
      const filters: any = {};
      if (selectedCategory !== 'All Categories') filters.type = selectedCategory.toLowerCase().replace(' ', '_');
      if (searchTerm) filters.search = searchTerm;
      
      const response = await productsAPI.getAll(filters);
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadKPIs = async () => {
    try {
      const [productsRes, stockRes] = await Promise.all([
        productsAPI.getAll(),
        stockLedgerAPI.getCurrentStock()
      ]);
      
      const totalProducts = productsRes.data.length;
      const stockValue = productsRes.data.reduce((sum: number, p: any) => sum + (p.stockQuantity * p.costPrice), 0);
      const lowStockItems = productsRes.data.filter((p: any) => p.stockQuantity <= p.minStockLevel).length;
      
      setKpis({ totalProducts, stockValue, lowStockItems, todayMovements: 0 });
    } catch (error) {
      console.error('Error loading KPIs:', error);
    }
  };

  const handleStockMovement = async (productId: string, type: string, quantity: number, reason: string) => {
    try {
      await stockLedgerAPI.createEntry({ productId, type, quantity, reason });
      loadProducts();
      loadKPIs();
    } catch (error) {
      console.error('Error creating stock movement:', error);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Stock Ledger</h1>
        <p className="text-gray-600">Track inventory levels and material movements</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Total Products"
          value={kpis.totalProducts}
          icon={ArchiveBoxIcon}
          color="bg-blue-500"
        />
        <KPICard
          title="Stock Value"
          value={`$${kpis.stockValue.toFixed(2)}`}
          icon={CurrencyDollarIcon}
          color="bg-green-500"
        />
        <KPICard
          title="Low Stock Items"
          value={kpis.lowStockItems}
          icon={ExclamationTriangleIcon}
          color="bg-yellow-500"
        />
        <KPICard
          title="Today's Movements"
          value={kpis.todayMovements}
          icon={ArrowsRightLeftIcon}
          color="bg-purple-500"
        />
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); loadProducts(); }}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <select 
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); loadProducts(); }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option>All Categories</option>
            <option>Finished Products</option>
            <option>Raw Materials</option>
            <option>Components</option>

          </select>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Stock Movement</span>
        </button>
      </div>

      {/* Product Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Product Inventory</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product: any) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.code}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{product.type?.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className={`text-sm font-medium ${
                        product.stockQuantity <= product.minStockLevel ? 'text-red-600' : 'text-gray-900'
                      }`}>
                        {product.stockQuantity} {product.unit}
                      </div>
                      <div className="text-sm text-gray-500">Min: {product.minStockLevel} {product.unit}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">${product.costPrice?.toFixed(2) || '0.00'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      ${((product.stockQuantity || 0) * (product.costPrice || 0)).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.stockQuantity <= product.minStockLevel 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-1 ${
                        product.stockQuantity <= product.minStockLevel ? 'bg-red-400' : 'bg-green-400'
                      }`}></div>
                      {product.stockQuantity <= product.minStockLevel ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => { setSelectedProduct(product); setShowStockModal(true); }}
                        className="text-teal-600 hover:text-teal-900"
                        title="Stock Movement"
                      >
                        <ArrowsRightLeftIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { setSelectedProduct(product); setShowModal(true); }}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Product Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
              <button onClick={() => setShowModal(false)}>
                <XMarkIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><strong>Code:</strong> {selectedProduct.code}</div>
              <div><strong>Name:</strong> {selectedProduct.name}</div>
              <div><strong>Type:</strong> {selectedProduct.type?.replace('_', ' ')}</div>
              <div><strong>Unit:</strong> {selectedProduct.unit}</div>
              <div><strong>Stock:</strong> {selectedProduct.stockQuantity}</div>
              <div><strong>Min Stock:</strong> {selectedProduct.minStockLevel}</div>
              <div><strong>Cost Price:</strong> ${selectedProduct.costPrice}</div>
              <div><strong>Total Value:</strong> ${(selectedProduct.stockQuantity * selectedProduct.costPrice).toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Stock Movement Modal */}
      {showStockModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Stock Movement</h3>
              <button onClick={() => setShowStockModal(false)}>
                <XMarkIcon className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await stockLedgerAPI.createEntry({
                  productId: selectedProduct._id,
                  type: stockMovement.type,
                  quantity: stockMovement.quantity,
                  reason: stockMovement.reason
                });
                setShowStockModal(false);
                setStockMovement({ type: 'in', quantity: 0, reason: '' });
                loadProducts();
                loadKPIs();
              } catch (error) {
                console.error('Error creating stock movement:', error);
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                  <input type="text" value={selectedProduct.name} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Movement Type</label>
                  <select 
                    value={stockMovement.type}
                    onChange={(e) => setStockMovement({...stockMovement, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="in">Stock In</option>
                    <option value="out">Stock Out</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input 
                    type="number"
                    value={stockMovement.quantity}
                    onChange={(e) => setStockMovement({...stockMovement, quantity: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <input 
                    type="text"
                    value={stockMovement.reason}
                    onChange={(e) => setStockMovement({...stockMovement, reason: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowStockModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600">Create Movement</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockLedger;
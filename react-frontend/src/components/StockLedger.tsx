import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import { ArchiveBoxIcon, CurrencyDollarIcon, ExclamationTriangleIcon, ArrowsRightLeftIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';

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

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll({ category: selectedCategory });
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const mockProducts = [
    {
      id: 'WT-001',
      name: 'Wooden Table',
      category: 'Furniture',
      stockLevel: 15,
      minStock: 5,
      unitCost: 450.00,
      totalValue: 6750.00,
      status: 'In Stock'
    },
    {
      id: 'WL-001',
      name: 'Wooden Legs',
      category: 'Components',
      stockLevel: 200,
      minStock: 50,
      unitCost: 25.00,
      totalValue: 5000.00,
      status: 'In Stock'
    },
    {
      id: 'WTP-001',
      name: 'Wooden Top',
      category: 'Components',
      stockLevel: 30,
      minStock: 10,
      unitCost: 180.00,
      totalValue: 5400.00,
      status: 'In Stock'
    },
    {
      id: 'SCR-001',
      name: 'Screws',
      category: 'Hardware',
      stockLevel: 5000,
      minStock: 1000,
      unitCost: 0.50,
      totalValue: 2500.00,
      status: 'In Stock'
    }
  ];

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
          value={products.length}
          icon={ArchiveBoxIcon}
          color="bg-blue-500"
        />
        <KPICard
          title="Stock Value"
          value="$20400"
          icon={CurrencyDollarIcon}
          color="bg-green-500"
        />
        <KPICard
          title="Low Stock Items"
          value={0}
          icon={ExclamationTriangleIcon}
          color="bg-yellow-500"
        />
        <KPICard
          title="Today's Movements"
          value={0}
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option>All Categories</option>
            <option>Furniture</option>
            <option>Components</option>
            <option>Hardware</option>
          </select>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <PlusIcon className="w-4 h-4" />
          <span>Add Product</span>
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
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.code}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{product.category}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{product.stockLevel} {product.unit || 'pieces'}</div>
                      <div className="text-sm text-gray-500">Min: {product.minStock} {product.unit || 'pieces'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">${product.unitCost.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">${(product.stockLevel * product.unitCost).toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></div>
                      In Stock
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button className="text-blue-600 hover:text-blue-900">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockLedger;
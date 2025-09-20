import React, { useState } from 'react';
import { DocumentTextIcon, MagnifyingGlassIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface BOMModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BOMModal: React.FC<BOMModalProps> = ({ isOpen, onClose }) => {
  const [components, setComponents] = useState([{ product: '', quantity: '', unit: 'pieces', notes: '' }]);
  const [operations, setOperations] = useState([{ workCenter: '', duration: '', description: '', sequence: 1 }]);

  const addComponent = () => {
    setComponents([...components, { product: '', quantity: '', unit: 'pieces', notes: '' }]);
  };

  const addOperation = () => {
    setOperations([...operations, { workCenter: '', duration: '', description: '', sequence: operations.length + 1 }]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New BOM</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Select a product</option>
                <option>Wooden Table</option>
                <option>Wooden Legs</option>
                <option>Wooden Top</option>
                <option>Screws</option>
                <option>Varnish Bottle</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Version *</label>
              <input 
                type="text" 
                defaultValue="1.0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Active</option>
                <option>Draft</option>
                <option>Archived</option>
              </select>
            </div>
          </div>

          {/* Components Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Components</h3>
              <button 
                onClick={addComponent}
                className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Component</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {components.map((component, index) => (
                <div key={index} className="grid grid-cols-4 gap-3">
                  <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>Select product</option>
                    <option>Wooden Table</option>
                    <option>Wooden Legs</option>
                    <option>Wooden Top</option>
                    <option>Screws</option>
                    <option>Varnish Bottle</option>
                  </select>
                  <input 
                    type="number" 
                    placeholder="1"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input 
                    type="text" 
                    placeholder="pieces"
                    defaultValue="pieces"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input 
                    type="text" 
                    placeholder="Notes (optional)"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Operations Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Operations</h3>
              <button 
                onClick={addOperation}
                className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Operation</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {operations.map((operation, index) => (
                <div key={index} className="grid grid-cols-4 gap-3">
                  <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option>Select work center</option>
                    <option>Assembly Line</option>
                    <option>Paint Floor</option>
                    <option>Packaging Line</option>
                  </select>
                  <input 
                    type="number" 
                    placeholder="60"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input 
                    type="text" 
                    placeholder="Description"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input 
                    type="number" 
                    placeholder="1"
                    defaultValue={index + 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Cost Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Cost Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Component Cost:</span>
                <span className="font-medium">$0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Operation Cost:</span>
                <span className="font-medium">$0.00</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="font-medium text-gray-900">Total Cost:</span>
                <span className="font-bold text-gray-900">$0.00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Create BOM
          </button>
        </div>
      </div>
    </div>
  );
};

const BillsOfMaterial: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mockBOMs = [
    {
      id: 'WL-001',
      name: 'Wooden Legs',
      version: 'v1.0',
      status: 'Active',
      components: 1,
      operations: 1,
      totalTime: '60min',
      totalCost: '$45035.00'
    },
    {
      id: 'SCR-001',
      name: 'Screws',
      version: 'v1.0',
      status: 'Active',
      components: 1,
      operations: 1,
      totalTime: '600min',
      totalCost: '$2000.00'
    }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bills of Material</h1>
        <p className="text-gray-600">Define material requirements and operations for products</p>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search BOMs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Create BOM</span>
        </button>
      </div>

      {/* BOM Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockBOMs.map((bom) => (
          <div key={bom.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{bom.name}</h3>
                <p className="text-sm text-gray-600">{bom.id}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {bom.version}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {bom.status}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <DocumentTextIcon className="w-4 h-4" />
                <span>{bom.components} Components</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <DocumentTextIcon className="w-4 h-4" />
                <span>{bom.operations} Operations</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <DocumentTextIcon className="w-4 h-4" />
                <span>{bom.totalTime} total</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <DocumentTextIcon className="w-4 h-4" />
                <span>{bom.totalCost} total cost</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Components</h4>
              <p className="text-sm text-gray-600">
                {bom.id === 'WL-001' ? '100x Wooden Table' : '100x Varnish Bottle'}
              </p>
            </div>
          </div>
        ))}
      </div>

      <BOMModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default BillsOfMaterial;
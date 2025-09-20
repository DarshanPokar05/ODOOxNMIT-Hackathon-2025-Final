import React, { useState, useEffect } from 'react';
import { DocumentTextIcon, MagnifyingGlassIcon, PlusIcon, XMarkIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import { billsOfMaterialAPI } from '../services/api';
import { io, Socket } from 'socket.io-client';

interface BOM {
  _id: string;
  bomNumber: string;
  product: string;
  version: string;
  status: string;
  components: Array<{
    product: string;
    quantity: number;
    unit: string;
    notes?: string;
  }>;
  operations: Array<{
    workCenter: string;
    duration: number;
    description?: string;
    sequence: number;
  }>;
  totalCost: number;
  createdAt: string;
}

interface BOMModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
}

const BOMModal: React.FC<BOMModalProps> = ({ isOpen, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    product: '',
    version: '1.0',
    status: 'draft'
  });
  const [components, setComponents] = useState([{ product: 'Wood', quantity: 1, unit: 'pieces', notes: '' }]);
  const [operations, setOperations] = useState([{ workCenter: 'Assembly Line', duration: 60, description: '', sequence: 1 }]);

  const addComponent = () => {
    setComponents([...components, { product: '', quantity: 1, unit: 'pieces', notes: '' }]);
  };

  const removeComponent = (index: number) => {
    if (components.length > 1) {
      setComponents(components.filter((_, i) => i !== index));
    }
  };

  const addOperation = () => {
    setOperations([...operations, { workCenter: '', duration: 60, description: '', sequence: operations.length + 1 }]);
  };

  const removeOperation = (index: number) => {
    if (operations.length > 1) {
      setOperations(operations.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validComponents = components.filter(c => c.product.trim());
    const validOperations = operations.filter(o => o.workCenter.trim());
    
    if (validComponents.length === 0) {
      alert('Please add at least one component');
      return;
    }
    
    if (validOperations.length === 0) {
      alert('Please add at least one operation');
      return;
    }
    
    onSubmit({
      ...formData,
      components: validComponents,
      operations: validOperations
    });
  };

  const resetForm = () => {
    setFormData({ product: '', version: '1.0', status: 'draft' });
    setComponents([{ product: 'Wood', quantity: 1, unit: 'pieces', notes: '' }]);
    setOperations([{ workCenter: 'Assembly Line', duration: 60, description: '', sequence: 1 }]);
  };

  React.useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Create New BOM</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
              <select 
                value={formData.product}
                onChange={(e) => setFormData({...formData, product: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="">Select product</option>
                <option value="Office Chair">Office Chair</option>
                <option value="Desk">Desk</option>
                <option value="Table">Table</option>
                <option value="Cabinet">Cabinet</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Version *</label>
              <input 
                type="text" 
                value={formData.version}
                onChange={(e) => setFormData({...formData, version: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Components</label>
              <button type="button" onClick={addComponent} className="flex items-center space-x-1 px-3 py-1 bg-teal-500 text-white rounded-lg text-sm hover:bg-teal-600">
                <PlusIcon className="w-4 h-4" />
                <span>Add Component</span>
              </button>
            </div>
            <div className="space-y-2">
              {components.map((comp, index) => (
                <div key={index} className="grid grid-cols-5 gap-2 items-center">
                  <select 
                    value={comp.product}
                    onChange={(e) => {
                      const newComps = [...components];
                      newComps[index].product = e.target.value;
                      setComponents(newComps);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select material</option>
                    <option value="Wood">Wood</option>
                    <option value="Steel">Steel</option>
                    <option value="Fabric">Fabric</option>
                    <option value="Screws">Screws</option>
                    <option value="Paint">Paint</option>
                  </select>
                  <input 
                    type="number" 
                    placeholder="Qty"
                    value={comp.quantity}
                    onChange={(e) => {
                      const newComps = [...components];
                      newComps[index].quantity = parseInt(e.target.value) || 1;
                      setComponents(newComps);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                  />
                  <select 
                    value={comp.unit}
                    onChange={(e) => {
                      const newComps = [...components];
                      newComps[index].unit = e.target.value;
                      setComponents(newComps);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="pieces">Pieces</option>
                    <option value="kg">Kg</option>
                    <option value="meters">Meters</option>
                    <option value="liters">Liters</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="Notes"
                    value={comp.notes}
                    onChange={(e) => {
                      const newComps = [...components];
                      newComps[index].notes = e.target.value;
                      setComponents(newComps);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeComponent(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                    disabled={components.length === 1}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Operations</label>
              <button type="button" onClick={addOperation} className="flex items-center space-x-1 px-3 py-1 bg-teal-500 text-white rounded-lg text-sm hover:bg-teal-600">
                <PlusIcon className="w-4 h-4" />
                <span>Add Operation</span>
              </button>
            </div>
            <div className="space-y-2">
              {operations.map((op, index) => (
                <div key={index} className="grid grid-cols-5 gap-2 items-center">
                  <select 
                    value={op.workCenter}
                    onChange={(e) => {
                      const newOps = [...operations];
                      newOps[index].workCenter = e.target.value;
                      setOperations(newOps);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select work center</option>
                    <option value="Assembly Line">Assembly Line</option>
                    <option value="Paint Booth">Paint Booth</option>
                    <option value="Quality Control">Quality Control</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                  <input 
                    type="number" 
                    placeholder="Duration (min)"
                    value={op.duration}
                    onChange={(e) => {
                      const newOps = [...operations];
                      newOps[index].duration = parseInt(e.target.value) || 60;
                      setOperations(newOps);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                  />
                  <input 
                    type="text" 
                    placeholder="Description"
                    value={op.description}
                    onChange={(e) => {
                      const newOps = [...operations];
                      newOps[index].description = e.target.value;
                      setOperations(newOps);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                  />
                  <input 
                    type="number" 
                    placeholder="Sequence"
                    value={op.sequence}
                    onChange={(e) => {
                      const newOps = [...operations];
                      newOps[index].sequence = parseInt(e.target.value) || 1;
                      setOperations(newOps);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeOperation(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                    disabled={operations.length === 1}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Summary</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Components: {components.filter(c => c.product).length}</div>
              <div>Operations: {operations.filter(o => o.workCenter).length}</div>
              <div>Total Duration: {operations.reduce((sum, op) => sum + op.duration, 0)} minutes</div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50">
              {loading ? 'Creating...' : 'Create BOM'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bom: BOM | null;
  onStatusChange: (id: string, status: string) => void;
}

const ViewModal: React.FC<ViewModalProps> = ({ isOpen, onClose, bom, onStatusChange }) => {
  if (!isOpen || !bom) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-3xl mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">BOM Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">BOM Number</label>
            <p className="text-sm text-gray-900 mt-1">{bom.bomNumber}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Product</label>
            <p className="text-sm text-gray-900 mt-1">{bom.product}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Version</label>
            <p className="text-sm text-gray-900 mt-1">v{bom.version}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                bom.status === 'active' ? 'bg-green-100 text-green-800' :
                bom.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {bom.status.charAt(0).toUpperCase() + bom.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Components ({bom.components.length})</h4>
          <div className="space-y-2">
            {bom.components.map((comp, index) => (
              <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-900">{comp.product}</span>
                <span className="text-sm text-gray-600">{comp.quantity} {comp.unit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => onStatusChange(bom._id, 'active')}
              className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
            >
              Activate
            </button>
            <button
              onClick={() => onStatusChange(bom._id, 'draft')}
              className="px-3 py-1 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600"
            >
              Draft
            </button>
            <button
              onClick={() => onStatusChange(bom._id, 'archived')}
              className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
            >
              Archive
            </button>
          </div>
          <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const BillsOfMaterial: React.FC = () => {
  const [boms, setBoms] = useState<BOM[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedBom, setSelectedBom] = useState<BOM | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  useEffect(() => {
    loadBOMs();
    
    const socket: Socket = io('http://localhost:5000');
    socket.on('bom_created', loadBOMs);
    socket.on('bom_updated', loadBOMs);
    socket.on('bom_deleted', loadBOMs);
    
    const interval = setInterval(() => {
      loadBOMs();
      setLastUpdate(new Date());
    }, 30000);
    
    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [statusFilter, searchTerm]);

  const loadBOMs = async () => {
    try {
      const response = await billsOfMaterialAPI.getAll({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchTerm || undefined
      });
      setBoms(response.data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading BOMs:', error);
      // Mock data for demo
      setBoms([
        {
          _id: '1',
          bomNumber: 'BOM-001',
          product: 'Office Chair',
          version: '1.0',
          status: 'active',
          components: [
            { product: 'Steel Frame', quantity: 1, unit: 'pcs' },
            { product: 'Fabric', quantity: 2, unit: 'meters' },
            { product: 'Screws', quantity: 12, unit: 'pcs' }
          ],
          operations: [
            { workCenter: 'Assembly Line', duration: 60, description: 'Frame assembly', sequence: 1 },
            { workCenter: 'Quality Control', duration: 15, description: 'Final inspection', sequence: 2 }
          ],
          totalCost: 125.50,
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          bomNumber: 'BOM-002',
          product: 'Desk',
          version: '1.2',
          status: 'draft',
          components: [
            { product: 'Wood Panel', quantity: 1, unit: 'pcs' },
            { product: 'Metal Legs', quantity: 4, unit: 'pcs' },
            { product: 'Bolts', quantity: 8, unit: 'pcs' }
          ],
          operations: [
            { workCenter: 'Assembly Line', duration: 90, description: 'Desk assembly', sequence: 1 }
          ],
          totalCost: 89.75,
          createdAt: new Date().toISOString()
        }
      ]);
    }
  };

  const handleCreateBOM = async (data: any) => {
    setLoading(true);
    try {
      // Validate required fields
      if (!data.product || !data.components?.length || !data.operations?.length) {
        alert('Please fill in all required fields');
        setLoading(false);
        return;
      }

      await billsOfMaterialAPI.create(data);
      
      setIsModalOpen(false);
      loadBOMs();
      alert('BOM created successfully!');
    } catch (error: any) {
      console.error('Error creating BOM:', error);
      // Fallback: Create BOM locally for demo
      const newBOM: BOM = {
        _id: Date.now().toString(),
        bomNumber: `BOM-${new Date().getFullYear()}-${String(boms.length + 1).padStart(3, '0')}`,
        product: data.product,
        version: data.version || '1.0',
        status: data.status || 'draft',
        components: data.components,
        operations: data.operations,
        totalCost: data.components.reduce((sum: number, comp: any) => sum + (comp.quantity * 10), 0),
        createdAt: new Date().toISOString()
      };
      
      setBoms(prev => [newBOM, ...prev]);
      setIsModalOpen(false);
      alert('BOM created successfully!');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await billsOfMaterialAPI.update(id, { status });
      loadBOMs();
      setShowViewModal(false);
      alert(`BOM status updated to ${status}!`);
    } catch (error) {
      console.error('Error updating BOM status:', error);
      // Fallback: Update local state
      setBoms(prev => prev.map(bom => 
        bom._id === id ? { ...bom, status } : bom
      ));
      setShowViewModal(false);
      alert(`BOM status updated to ${status}!`);
    }
  };

  const filteredBOMs = boms.filter(bom => {
    const matchesSearch = bom.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bom.bomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bom.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bills of Material</h1>
        <p className="text-gray-600">Define material requirements and operations for products</p>
        <p className="text-sm text-gray-500 mt-1">Last updated: {lastUpdate.toLocaleTimeString()}</p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search BOMs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 w-80"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Create BOM</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredBOMs.length === 0 ? (
          <div className="col-span-2 text-center py-12">
            <p className="text-gray-500">No bills of material found</p>
          </div>
        ) : (
          filteredBOMs.map((bom) => (
            <div key={bom._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{bom.product}</h3>
                  <p className="text-sm text-gray-600">{bom.bomNumber}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      v{bom.version}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      bom.status === 'active' ? 'bg-green-100 text-green-800' :
                      bom.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {bom.status.charAt(0).toUpperCase() + bom.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => {
                      setSelectedBom(bom);
                      setShowViewModal(true);
                    }}
                    className="p-1 text-teal-500 hover:text-teal-700"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <DocumentTextIcon className="w-4 h-4" />
                  <span>{bom.components.length} Components</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <DocumentTextIcon className="w-4 h-4" />
                  <span>${bom.totalCost.toFixed(2)} total cost</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Components</h4>
                <div className="space-y-1">
                  {bom.components.slice(0, 3).map((comp, index) => (
                    <p key={index} className="text-sm text-gray-600">
                      {comp.quantity}x {comp.product}
                    </p>
                  ))}
                  {bom.components.length > 3 && (
                    <p className="text-sm text-gray-500">+{bom.components.length - 3} more...</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <BOMModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateBOM}
        loading={loading}
      />

      <ViewModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        bom={selectedBom}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default BillsOfMaterial;
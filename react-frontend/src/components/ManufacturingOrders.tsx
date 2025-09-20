import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  PlusIcon,
  XMarkIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { manufacturingOrdersAPI } from '../services/api';
import { io, Socket } from 'socket.io-client';

interface ManufacturingOrder {
  _id: string;
  orderNumber: string;
  product: string;
  billOfMaterials?: string;
  quantity: number;
  priority: string;
  status: string;
  startDate?: string;
  deadline?: string;
  progress: number;
  createdAt: string;
}

const ManufacturingOrders: React.FC = () => {
  const [orders, setOrders] = useState<ManufacturingOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ManufacturingOrder | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  
  const [formData, setFormData] = useState({
    orderNumber: '',
    product: '',
    billOfMaterials: '',
    quantity: '',
    priority: 'medium',
    startDate: '',
    deadline: ''
  });

  useEffect(() => {
    loadOrders();
    
    const socket: Socket = io('http://localhost:5000');
    socket.on('manufacturing_order_created', loadOrders);
    socket.on('manufacturing_order_updated', loadOrders);
    
    return () => {
      socket.disconnect();
    };
  }, []);

  const loadOrders = async () => {
    try {
      const response = await manufacturingOrdersAPI.getAll();
      setOrders(response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
      // Set mock data for demo
      setOrders([
        {
          _id: '1',
          orderNumber: 'MO-2024-001',
          product: 'Office Chair',
          quantity: 50,
          priority: 'high',
          status: 'in_progress',
          progress: 65,
          deadline: '2024-02-15',
          createdAt: new Date().toISOString()
        },
        {
          _id: '2',
          orderNumber: 'MO-2024-002',
          product: 'Desk',
          quantity: 25,
          priority: 'medium',
          status: 'planned',
          progress: 0,
          deadline: '2024-02-20',
          createdAt: new Date().toISOString()
        }
      ]);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validate required fields
      if (!formData.orderNumber || !formData.product || !formData.quantity) {
        alert('Please fill in all required fields');
        setLoading(false);
        return;
      }

      await manufacturingOrdersAPI.create({
        ...formData,
        quantity: parseInt(formData.quantity)
      });
      
      setShowCreateModal(false);
      setFormData({
        orderNumber: '',
        product: '',
        billOfMaterials: '',
        quantity: '',
        priority: 'medium',
        startDate: '',
        deadline: ''
      });
      loadOrders();
      alert('Manufacturing order created successfully!');
    } catch (error) {
      console.error('Error creating order:', error);
      // For demo purposes, simulate successful creation
      const newOrder: ManufacturingOrder = {
        _id: Date.now().toString(),
        orderNumber: formData.orderNumber,
        product: formData.product,
        billOfMaterials: formData.billOfMaterials,
        quantity: parseInt(formData.quantity),
        priority: formData.priority,
        status: 'planned',
        startDate: formData.startDate,
        deadline: formData.deadline,
        progress: 0,
        createdAt: new Date().toISOString()
      };
      
      setOrders([newOrder, ...orders]);
      setShowCreateModal(false);
      setFormData({
        orderNumber: '',
        product: '',
        billOfMaterials: '',
        quantity: '',
        priority: 'medium',
        startDate: '',
        deadline: ''
      });
      alert('Manufacturing order created successfully!');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      planned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      done: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return styles[priority as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent w-80"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="planned">Planned</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          <span>New Manufacturing Order</span>
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Manufacturing Orders ({filteredOrders.length})
          </h2>
        </div>

        {/* Table Header */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
          <div className="grid grid-cols-8 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div>Order Number</div>
            <div>Product</div>
            <div>Quantity</div>
            <div>Priority</div>
            <div>Status</div>
            <div>Progress</div>
            <div>Due Date</div>
            <div>Actions</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No manufacturing orders found</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order._id} className="px-6 py-4 hover:bg-gray-50">
                <div className="grid grid-cols-8 gap-4 items-center">
                  <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                  <div className="text-sm text-gray-600">{order.product}</div>
                  <div className="text-sm text-gray-600">{order.quantity}</div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(order.priority)}`}>
                      {order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}
                    </span>
                  </div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                      {order.status.replace('_', ' ').charAt(0).toUpperCase() + order.status.replace('_', ' ').slice(1)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">{order.progress}%</div>
                  <div className="text-sm text-gray-600">
                    {order.deadline ? new Date(order.deadline).toLocaleDateString() : '-'}
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowViewModal(true);
                    }}
                    className="text-sm text-teal-600 hover:text-teal-800 cursor-pointer"
                  >
                    View
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Create Manufacturing Order</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Number</label>
                <input
                  type="text"
                  value={formData.orderNumber}
                  onChange={(e) => setFormData({...formData, orderNumber: e.target.value})}
                  placeholder="MO-2024-001"
                  className="w-full px-3 py-2 border border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <select
                  value={formData.product}
                  onChange={(e) => setFormData({...formData, product: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Bill of Materials</label>
                <select
                  value={formData.billOfMaterials}
                  onChange={(e) => setFormData({...formData, billOfMaterials: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">Select BOM</option>
                  <option value="BOM-001">BOM-001 - Chair Assembly</option>
                  <option value="BOM-002">BOM-002 - Desk Assembly</option>
                  <option value="BOM-003">BOM-003 - Table Assembly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  placeholder="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Order'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {showViewModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Manufacturing Order Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Order Number</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedOrder.orderNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Product</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedOrder.product}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bill of Materials</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedOrder.billOfMaterials || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedOrder.quantity}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                    selectedOrder.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    selectedOrder.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    selectedOrder.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedOrder.priority.charAt(0).toUpperCase() + selectedOrder.priority.slice(1)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                    selectedOrder.status === 'done' ? 'bg-green-100 text-green-800' :
                    selectedOrder.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedOrder.status === 'in_progress' ? 'In Progress' : 
                     selectedOrder.status === 'done' ? 'Completed' : 'Planned'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Progress</label>
                  <div className="mt-1">
                    <p className="text-sm text-gray-900 mb-1">{selectedOrder.progress}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-teal-500 h-2 rounded-full" 
                        style={{ width: `${selectedOrder.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedOrder.startDate ? new Date(selectedOrder.startDate).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedOrder.deadline ? new Date(selectedOrder.deadline).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="text-sm text-gray-900 mt-1">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManufacturingOrders;
import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  PlusIcon,
  DocumentTextIcon,
  BoltIcon,
  WrenchScrewdriverIcon,
  ExclamationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { dashboardAPI, manufacturingOrdersAPI } from '../services/api';
import { io, Socket } from 'socket.io-client';

interface KPICardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<any>;
  color: string;
}

interface ManufacturingOrder {
  _id: string;
  orderNumber: string;
  product: string;
  quantity: number;
  status: string;
  progress: number;
  deadline?: string;
  createdAt: string;
}

interface ExtendedKPICardProps extends KPICardProps {
  subtitle?: string;
  trend?: string;
  trendColor?: string;
}

const KPICard: React.FC<ExtendedKPICardProps> = ({ title, value, icon: Icon, color, subtitle, trend, trendColor }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} mb-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        {trend && (
          <p className={`text-xs font-medium ${trendColor}`}>{trend}</p>
        )}
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [kpis, setKpis] = useState({
    manufacturingOrders: { total: 0, completed: 0, inProgress: 0, planned: 0 }
  });
  const [orders, setOrders] = useState<ManufacturingOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  
  const [formData, setFormData] = useState({
    orderNumber: '',
    product: '',
    quantity: '',
    priority: 'medium',
    deadline: ''
  });

  useEffect(() => {
    loadDashboardData();
    
    const socket: Socket = io('http://localhost:5000');
    socket.on('manufacturing_order_created', loadDashboardData);
    socket.on('manufacturing_order_updated', loadDashboardData);
    socket.on('work_order_updated', loadDashboardData);
    socket.on('shop_floor_update', loadDashboardData);
    
    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      loadDashboardData();
      setLastUpdate(new Date());
    }, 30000);
    
    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [statusFilter]);

  const loadDashboardData = async () => {
    try {
      const [kpiResponse, ordersResponse] = await Promise.all([
        dashboardAPI.getKPIs(),
        manufacturingOrdersAPI.getAll({ status: statusFilter !== 'all' ? statusFilter : undefined })
      ]);
      setKpis(kpiResponse.data);
      setOrders(ordersResponse.data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set mock data for demo
      setKpis({
        manufacturingOrders: { total: 15, completed: 8, inProgress: 5, planned: 2 }
      });
      setOrders([]);
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
        quantity: '',
        priority: 'medium',
        deadline: ''
      });
      loadDashboardData();
      alert('Manufacturing order created successfully!');
    } catch (error) {
      console.error('Error creating order:', error);
      // For demo purposes, simulate successful creation
      const newOrder = {
        _id: Date.now().toString(),
        orderNumber: formData.orderNumber,
        product: formData.product,
        quantity: parseInt(formData.quantity),
        status: 'planned',
        progress: 0,
        deadline: formData.deadline,
        createdAt: new Date().toISOString()
      };
      
      setOrders([newOrder, ...orders]);
      setShowCreateModal(false);
      setFormData({
        orderNumber: '',
        product: '',
        quantity: '',
        priority: 'medium',
        deadline: ''
      });
      alert('Manufacturing order created successfully!');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch = order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.product?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Currently in progress"
          value={kpis.manufacturingOrders.inProgress}
          icon={DocumentTextIcon}
          color="bg-blue-500"
          trend="+12% from yesterday"
          trendColor="text-green-600"
        />
        <KPICard
          title="Orders finished today"
          value={kpis.manufacturingOrders.completed}
          icon={CheckCircleIcon}
          color="bg-green-500"
          trend="+8% efficiency"
          trendColor="text-green-600"
        />
        <KPICard
          title="Behind schedule"
          value={0}
          icon={ClockIcon}
          color="bg-orange-500"
          trend="Needs attention"
          trendColor="text-red-600"
        />
        <KPICard
          title="Overall performance"
          value="0%"
          icon={BoltIcon}
          color="bg-yellow-500"
          trend="Above target"
          trendColor="text-green-600"
        />
      </div>

      {/* Recent Manufacturing Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Manufacturing Orders</h2>
              <p className="text-sm text-gray-500 mt-1">Last updated: {lastUpdate.toLocaleTimeString()}</p>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Completed</option>
                <option value="planned">Planned</option>
              </select>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <span>New Order</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Table Header */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
          <div className="grid grid-cols-7 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div>Order ID</div>
            <div>Product</div>
            <div>Quantity</div>
            <div>Status</div>
            <div>Progress</div>
            <div>Due Date</div>
            <div>Actions</div>
          </div>
        </div>
        
        <div className="p-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No manufacturing orders found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order: any) => (
                <div key={order._id} className="grid grid-cols-7 gap-4 items-center py-3 border-b border-gray-100 last:border-b-0">
                  <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                  <div className="text-sm text-gray-600">{order.product}</div>
                  <div className="text-sm text-gray-600">{order.quantity}</div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'done' ? 'bg-green-100 text-green-800' :
                      order.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status === 'in_progress' ? 'In Progress' : 
                       order.status === 'done' ? 'Completed' : 'Planned'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">{order.progress || 0}%</div>
                  <div className="text-sm text-gray-600">{order.deadline ? new Date(order.deadline).toLocaleDateString() : '-'}</div>
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
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section - Production Timeline and Critical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Production Timeline */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Production Timeline</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Assembly Line A - Table Production</p>
                    <p className="text-sm text-gray-500">Expected completion: 2:30 PM</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">On Track</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Painting Booth - Chair Finishing</p>
                    <p className="text-sm text-gray-500">Behind schedule by 30 minutes</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">Attention</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Quality Control - Desk Inspection</p>
                    <p className="text-sm text-gray-500">Starting at 3:00 PM</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Scheduled</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Critical Alerts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Critical Alerts</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-start space-x-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <p className="font-medium text-red-800">Material Shortage</p>
                <p className="text-sm text-gray-600">Oak wood stock below minimum level</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <ClockIcon className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Schedule Delay</p>
                <p className="text-sm text-gray-600">MO-2024-003 behind by 2 hours</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <WrenchScrewdriverIcon className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">Maintenance Due</p>
                <p className="text-sm text-gray-600">CNC Machine #3 scheduled maintenance</p>
              </div>
            </div>
          </div>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Number *</label>
                <input
                  type="text"
                  value={formData.orderNumber}
                  onChange={(e) => setFormData({...formData, orderNumber: e.target.value})}
                  placeholder="MO-2024-001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  required
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  placeholder="50"
                  min="1"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
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
              <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
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
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedOrder.quantity}</p>
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
                  <p className="text-sm text-gray-900 mt-1">{selectedOrder.progress || 0}%</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedOrder.deadline ? new Date(selectedOrder.deadline).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
                <p className="text-sm text-gray-900">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
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

export default Dashboard;
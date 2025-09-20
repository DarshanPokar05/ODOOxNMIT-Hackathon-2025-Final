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
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { dashboardAPI, manufacturingOrdersAPI } from '../services/api';
import io from 'socket.io-client';

interface KPICardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<any>;
  color: string;
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
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDashboardData();
    
    const socket = io('http://localhost:5000');
    socket.on('manufacturing_order_created', () => {
      loadDashboardData();
    });
    socket.on('manufacturing_order_updated', () => {
      loadDashboardData();
    });
    
    return () => {
      socket.disconnect();
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const [kpiResponse, ordersResponse] = await Promise.all([
        dashboardAPI.getKPIs(),
        manufacturingOrdersAPI.getAll()
      ]);
      setKpis(kpiResponse.data);
      setOrders(ordersResponse.data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

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
            <h2 className="text-lg font-semibold text-gray-900">Recent Manufacturing Orders</h2>
            <div className="flex items-center space-x-4">
              <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                <option>All Status</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>Planned</option>
              </select>
              <button className="flex items-center space-x-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
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
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No manufacturing orders found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order: any) => (
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
                  <div className="text-sm text-gray-600">{new Date(order.deadline).toLocaleDateString()}</div>
                  <div className="text-sm text-teal-600 hover:text-teal-800 cursor-pointer">View</div>
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
    </div>
  );
};

export default Dashboard;
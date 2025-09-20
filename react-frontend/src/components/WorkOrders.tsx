import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ChevronDownIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { workOrdersAPI } from '../services/api';
import { io, Socket } from 'socket.io-client';

interface WorkOrder {
  _id: string;
  workOrderNumber: string;
  workCenter: string;
  operation: string;
  status: string;
  priority: string;
  estimatedDuration?: number;
  actualDuration?: number;
  startDate?: string;
  endDate?: string;
  assignedTo?: string;
  progress: number;
  createdAt: string;
}

const WorkOrders: React.FC = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [workCenterFilter, setWorkCenterFilter] = useState('all');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showWorkCenterDropdown, setShowWorkCenterDropdown] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Status', checked: true },
    { value: 'planned', label: 'Planned', checked: false },
    { value: 'started', label: 'Started', checked: false },
    { value: 'paused', label: 'Paused', checked: false },
    { value: 'completed', label: 'Completed', checked: false },
    { value: 'cancelled', label: 'Cancelled', checked: false }
  ];

  const workCenterOptions = [
    { value: 'all', label: 'All Work Centers', checked: true },
    { value: 'Assembly Line A', label: 'Assembly Line A', checked: false },
    { value: 'Painting Booth', label: 'Painting Booth', checked: false },
    { value: 'Quality Control', label: 'Quality Control', checked: false },
    { value: 'Packaging', label: 'Packaging', checked: false }
  ];

  useEffect(() => {
    loadWorkOrders();
    
    const socket: Socket = io('http://localhost:5000');
    socket.on('work_order_created', loadWorkOrders);
    socket.on('work_order_updated', loadWorkOrders);
    
    return () => {
      socket.disconnect();
    };
  }, []);

  const loadWorkOrders = async () => {
    try {
      const response = await workOrdersAPI.getAll({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        workCenter: workCenterFilter !== 'all' ? workCenterFilter : undefined
      });
      setWorkOrders(response.data);
    } catch (error) {
      console.error('Error loading work orders:', error);
      // Mock data for demo
      setWorkOrders([]);
    }
  };

  const filteredOrders = workOrders.filter(order => {
    const matchesSearch = order.workOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.operation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.workCenter.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesWorkCenter = workCenterFilter === 'all' || order.workCenter === workCenterFilter;
    return matchesSearch && matchesStatus && matchesWorkCenter;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      planned: 'bg-blue-100 text-blue-800',
      started: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
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
              placeholder="Search work orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent w-80"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <FunnelIcon className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">
                {statusOptions.find(opt => opt.value === statusFilter)?.label || 'All Status'}
              </span>
              <ChevronDownIcon className="w-4 h-4 text-gray-500" />
            </button>

            {showStatusDropdown && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-2">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setStatusFilter(option.value);
                        setShowStatusDropdown(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2 text-left hover:bg-gray-50"
                    >
                      <span className="text-gray-700">{option.label}</span>
                      {statusFilter === option.value && (
                        <CheckIcon className="w-4 h-4 text-teal-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Work Center Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowWorkCenterDropdown(!showWorkCenterDropdown)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <span className="text-gray-700">
                {workCenterOptions.find(opt => opt.value === workCenterFilter)?.label || 'All Work Centers'}
              </span>
              <ChevronDownIcon className="w-4 h-4 text-gray-500" />
            </button>

            {showWorkCenterDropdown && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="py-2">
                  {workCenterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setWorkCenterFilter(option.value);
                        setShowWorkCenterDropdown(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2 text-left hover:bg-gray-50"
                    >
                      <span className="text-gray-700">{option.label}</span>
                      {workCenterFilter === option.value && (
                        <CheckIcon className="w-4 h-4 text-teal-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Work Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Work Orders ({filteredOrders.length})
          </h2>
        </div>

        {/* Table Header */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
          <div className="grid grid-cols-7 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div>Work Order</div>
            <div>Operation</div>
            <div>Work Center</div>
            <div>Status</div>
            <div>Priority</div>
            <div>Assigned To</div>
            <div>Progress</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No work orders found</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order._id} className="px-6 py-4 hover:bg-gray-50">
                <div className="grid grid-cols-7 gap-4 items-center">
                  <div className="text-sm font-medium text-gray-900">{order.workOrderNumber}</div>
                  <div className="text-sm text-gray-600">{order.operation}</div>
                  <div className="text-sm text-gray-600">{order.workCenter}</div>
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 capitalize">{order.priority}</div>
                  <div className="text-sm text-gray-600">{order.assignedTo || '-'}</div>
                  <div className="text-sm text-gray-600">{order.progress}%</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkOrders;
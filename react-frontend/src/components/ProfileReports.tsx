import React, { useState } from 'react';
import { DocumentChartBarIcon, ClockIcon, CheckCircleIcon, CalendarIcon } from '@heroicons/react/24/outline';

const ProfileReports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const workOrders = [
    { id: 'WO-001', product: 'Steel Frame A', status: 'Completed', duration: '4h 30m', date: '2025-01-25', efficiency: 95 },
    { id: 'WO-002', product: 'Motor Assembly', status: 'Completed', duration: '6h 15m', date: '2025-01-24', efficiency: 88 },
    { id: 'WO-003', product: 'Control Panel', status: 'Completed', duration: '3h 45m', date: '2025-01-23', efficiency: 92 },
    { id: 'WO-004', product: 'Bearing Unit', status: 'In Progress', duration: '2h 20m', date: '2025-01-26', efficiency: 85 },
    { id: 'WO-005', product: 'Hydraulic Pump', status: 'Completed', duration: '5h 10m', date: '2025-01-22', efficiency: 90 }
  ];

  const stats = {
    totalOrders: 12,
    completedOrders: 10,
    totalDuration: '45h 30m',
    avgEfficiency: 90,
    thisWeek: {
      orders: 5,
      duration: '21h 00m',
      efficiency: 89
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DocumentChartBarIcon className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile Reports</h1>
                <p className="text-gray-500">View your work performance and completed tasks</p>
              </div>
            </div>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Duration</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDuration}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <DocumentChartBarIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Efficiency</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgEfficiency}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Work Duration Report */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Work Duration Report</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.thisWeek.orders}</div>
                <div className="text-sm text-gray-500">Orders This Week</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{stats.thisWeek.duration}</div>
                <div className="text-sm text-gray-500">Hours This Week</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{stats.thisWeek.efficiency}%</div>
                <div className="text-sm text-gray-500">Efficiency This Week</div>
              </div>
            </div>
          </div>
        </div>

        {/* Work Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Work Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Efficiency
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.product}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'Completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 text-gray-400 mr-1" />
                        {order.duration}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <CalendarIcon className="w-4 h-4 text-gray-400 mr-1" />
                        {order.date}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${order.efficiency}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{order.efficiency}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileReports;
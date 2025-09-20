import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, WrenchScrewdriverIcon, UsersIcon, CurrencyDollarIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import { workCentersAPI } from '../services/api';
import io from 'socket.io-client';

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

const WorkCenters: React.FC = () => {
  const [workCenters, setWorkCenters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadWorkCenters();
    
    const socket = io('http://localhost:5000');
    socket.on('work_center_created', () => {
      loadWorkCenters();
    });
    
    return () => {
      socket.disconnect();
    };
  }, []);

  const loadWorkCenters = async () => {
    try {
      const response = await workCentersAPI.getAll();
      setWorkCenters(response.data);
    } catch (error) {
      console.error('Error loading work centers:', error);
    }
  };

  const mockWorkCenters = [
    {
      _id: '1',
      name: 'Assembly Line',
      code: 'AL-001',
      location: 'Floor 1, Section A',
      status: 'active',
      costPerHour: 50,
      capacity: 8,
      utilization: 14,
      currentUtilization: 14,
      description: 'Main assembly line for furniture',
      todaySchedule: [
        { time: '09:00 - 12:00', task: 'Assembly Operation' },
        { time: '14:00 - 16:00', task: 'Quality Check' }
      ]
    },
    {
      _id: '2',
      name: 'Paint Floor',
      code: 'PF-002',
      location: 'Floor 2, Section B',
      status: 'active',
      costPerHour: 35,
      capacity: 4,
      utilization: 75,
      currentUtilization: 75,
      description: 'Painting and finishing station',
      todaySchedule: [
        { time: '09:00 - 12:00', task: 'Assembly Operation' },
        { time: '14:00 - 16:00', task: 'Quality Check' },
        { time: '16:00 - 18:00', task: 'Assembly' }
      ]
    },
    {
      _id: '3',
      name: 'Packaging Line',
      code: 'PL-003',
      location: 'Floor 1, Section C',
      status: 'active',
      costPerHour: 25,
      capacity: 6,
      utilization: 38,
      currentUtilization: 38,
      description: 'Final packaging and quality check',
      todaySchedule: [
        { time: '09:00 - 12:00', task: 'Assembly Operation' },
        { time: '14:00 - 16:00', task: 'Quality Check' },
        { time: '16:00 - 18:00', task: 'Assembly' }
      ]
    }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Work Centers</h1>
        <p className="text-gray-600">Manage machines, locations, and production capacity</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Active"
          value={3}
          icon={CheckCircleIcon}
          color="bg-green-500"
        />
        <KPICard
          title="Maintenance"
          value={0}
          icon={WrenchScrewdriverIcon}
          color="bg-yellow-500"
        />
        <KPICard
          title="Total Capacity"
          value={18}
          icon={UsersIcon}
          color="bg-blue-500"
        />
        <KPICard
          title="Avg Cost/Hour"
          value="$37"
          icon={CurrencyDollarIcon}
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
              placeholder="Search work centers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>All Status</option>
            <option>Active</option>
            <option>Maintenance</option>
          </select>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <PlusIcon className="w-4 h-4" />
          <span>Add Work Center</span>
        </button>
      </div>

      {/* Work Centers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {mockWorkCenters.map((center) => (
          <div key={center._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{center.name}</h3>
                <p className="text-sm text-gray-600">{center.location}</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                  center.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {center.status}
                </span>
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

            <p className="text-sm text-gray-600 mb-4">{center.description}</p>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Cost per Hour</span>
                <span className="font-medium">${center.costPerHour}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Capacity</span>
                <span className="font-medium">{center.capacity} units</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Utilization</span>
                <span className="font-medium">{center.utilization}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current Utilization</span>
                <span className="font-medium">{center.currentUtilization}%</span>
              </div>
            </div>

            {/* Utilization Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Current Utilization</span>
                <span>{center.currentUtilization}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    center.currentUtilization > 80 ? 'bg-red-500' :
                    center.currentUtilization > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${center.currentUtilization}%` }}
                ></div>
              </div>
            </div>

            {/* Today's Schedule */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Today's Schedule</h4>
              <div className="space-y-1">
                {center.todaySchedule.map((schedule, index) => (
                  <div key={index} className="text-xs text-gray-600">
                    <span className="font-medium">{schedule.time}</span> {schedule.task}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkCenters;
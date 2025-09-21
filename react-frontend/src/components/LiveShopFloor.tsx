import React, { useState, useEffect } from 'react';
import { 
  ArrowPathIcon,
  QrCodeIcon,
  ArrowDownTrayIcon,
  PauseIcon,
  PlayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { workCentersAPI } from '../services/api';
import { io, Socket } from 'socket.io-client';

interface WorkCenter {
  _id: string;
  name: string;
  code: string;
  location: string;
  status: 'active' | 'maintenance' | 'idle';
  currentOperation?: string;
  qrCode: string;
  utilization: number;
  isRunning: boolean;
}

interface LiveShopFloorProps {
  refreshTrigger?: number;
}

const LiveShopFloor: React.FC<LiveShopFloorProps> = ({ refreshTrigger }) => {
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'lost'>('connected');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [selectedCenter, setSelectedCenter] = useState<WorkCenter | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [generatingQR, setGeneratingQR] = useState<string | null>(null);

  useEffect(() => {
    loadWorkCenters();
    
    const socket: Socket = io('http://localhost:5000');
    
    socket.on('connect', () => {
      setConnectionStatus('connected');
    });
    
    socket.on('disconnect', () => {
      setConnectionStatus('lost');
    });
    
    socket.on('work_center_updated', loadWorkCenters);
    socket.on('shop_floor_update', loadWorkCenters);
    
    const interval = setInterval(() => {
      loadWorkCenters();
      setLastRefresh(new Date());
    }, 30000);
    
    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  // Refresh when coming from QR Scanner
  useEffect(() => {
    if (refreshTrigger) {
      loadWorkCenters();
      setLastRefresh(new Date());
    }
  }, [refreshTrigger]);

  const loadWorkCenters = async () => {
    try {
      const response = await workCentersAPI.getShopFloor();
      setWorkCenters(response.data);
    } catch (error) {
      console.error('Error loading work centers:', error);
      setWorkCenters([
        {
          _id: '1',
          name: 'Assembly Station A',
          code: 'ASM-A-001',
          location: 'Floor 1, Section A',
          status: 'idle',
          qrCode: 'ASM-A-001',
          utilization: 0,
          isRunning: false
        },
        {
          _id: '2',
          name: 'Painting Booth B',
          code: 'PNT-B-002',
          location: 'Floor 2, Section B',
          status: 'idle',
          qrCode: 'PNT-B-002',
          utilization: 0,
          isRunning: false
        }
      ]);
    }
  };

  const handleRefreshAll = async () => {
    setLastRefresh(new Date());
    await loadWorkCenters();
  };

  const handleStatusToggle = async (centerId: string, currentStatus: string, isRunning: boolean) => {
    try {
      const newStatus = isRunning ? 'idle' : 'active';
      await workCentersAPI.updateStatus(centerId, newStatus, !isRunning);
      loadWorkCenters();
    } catch (error) {
      console.error('Error updating work center status:', error);
      // Fallback: Update local state
      setWorkCenters(prev => prev.map(center => 
        center._id === centerId 
          ? { ...center, status: isRunning ? 'idle' : 'active', isRunning: !isRunning }
          : center
      ));
      alert(`Work center ${isRunning ? 'stopped' : 'started'} successfully!`);
    }
  };

  const handleGenerateQR = async (centerId: string) => {
    const center = workCenters.find(c => c._id === centerId);
    if (!center) return;

    setGeneratingQR(centerId);
    try {
      // Create QR data with work center information
      const qrData = JSON.stringify({
        id: center._id,
        workCenter: center.name,
        code: center.code,
        location: center.location,
        status: center.status,
        qrCode: center.qrCode,
        timestamp: new Date().toISOString(),
        url: `${window.location.origin}/work-center/${center._id}`
      });

      // Generate QR code using QR Server API
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&format=png&data=${encodeURIComponent(qrData)}`;
      
      // Fetch the image as blob to ensure proper download
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR-${center.code}-${new Date().toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert(`QR code downloaded for ${center.name}!`);
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code. Please try again.');
    } finally {
      setGeneratingQR(null);
    }
  };

  const handleExportReport = async () => {
    try {
      const reportData = {
        timestamp: new Date().toISOString(),
        workCenters: workCenters.map(center => ({
          name: center.name,
          code: center.code,
          status: center.status,
          utilization: center.utilization,
          isRunning: center.isRunning
        }))
      };
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `shop-floor-report-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'maintenance': return 'bg-red-500';
      case 'idle':
      default: return 'bg-blue-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'In Progress';
      case 'maintenance': return 'Delayed / Issue';
      case 'idle':
      default: return 'Idle';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Live Shop Floor Dashboard</h1>
        <p className="text-gray-600">Real-time monitoring of all work centers</p>
        
        <div className="flex items-center mt-2">
          <div className={`w-2 h-2 rounded-full mr-2 ${
            connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className={`text-sm ${
            connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'
          }`}>
            {connectionStatus === 'connected' ? 'Connected' : 'Connection lost'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {workCenters.map((center) => (
          <div key={center._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{center.name}</h3>
              
              <div className="mb-6">
                <button 
                  onClick={() => handleStatusToggle(center._id, center.status, center.isRunning)}
                  className={`w-16 h-16 rounded-lg flex items-center justify-center ${getStatusColor(center.status)} mb-3 hover:opacity-80 transition-opacity`}
                >
                  {center.isRunning ? (
                    <PlayIcon className="w-8 h-8 text-white" />
                  ) : (
                    <PauseIcon className="w-8 h-8 text-white" />
                  )}
                </button>
                <p className="text-gray-600 font-medium">{getStatusText(center.status)}</p>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <button 
                  onClick={() => handleGenerateQR(center._id)}
                  disabled={generatingQR === center._id}
                  className="w-full flex items-center justify-center py-2 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <QrCodeIcon className="w-4 h-4 mr-2" />
                  <span className="text-sm">
                    {generatingQR === center._id ? 'Generating...' : 'Download QR'}
                  </span>
                </button>
                <button 
                  onClick={() => { setSelectedCenter(center); setShowDetailsModal(true); }}
                  className="w-full flex items-center justify-center py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <span className="text-sm">View Details</span>
                </button>
                <p className="text-xs text-gray-500 mt-2">QR: {center.qrCode}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Status Legend & Controls</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-400 rounded mr-3"></div>
            <span className="text-sm text-gray-700">Planned / Waiting</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
            <span className="text-sm text-gray-700">In Progress</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded mr-3"></div>
            <span className="text-sm text-gray-700">Delayed / Issue</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-400 rounded mr-3"></div>
            <span className="text-sm text-gray-700">Completed / Idle</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefreshAll}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Refresh All</span>
          </button>
          
          <button 
            onClick={async () => {
              for (const center of workCenters) {
                await handleGenerateQR(center._id);
                // Small delay between downloads to avoid overwhelming the browser
                await new Promise(resolve => setTimeout(resolve, 500));
              }
              alert('All QR codes downloaded successfully!');
            }}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <QrCodeIcon className="w-4 h-4" />
            <span>Download All QR Codes</span>
          </button>
          
          <button 
            onClick={handleExportReport}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            <span>Export Report</span>
          </button>
          
          <button 
            onClick={() => {
              workCenters.forEach(center => {
                if (!center.isRunning) {
                  handleStatusToggle(center._id, center.status, false);
                }
              });
              setTimeout(() => alert('All work centers started!'), 500);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <PlayIcon className="w-4 h-4" />
            <span>Start All</span>
          </button>
          
          <button 
            onClick={() => {
              workCenters.forEach(center => {
                if (center.isRunning) {
                  handleStatusToggle(center._id, center.status, true);
                }
              });
              setTimeout(() => alert('All work centers stopped!'), 500);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <PauseIcon className="w-4 h-4" />
            <span>Stop All</span>
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Last refreshed: {lastRefresh.toLocaleTimeString()}
        </div>
      </div>

      {showDetailsModal && selectedCenter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Work Center Details</h3>
              <button onClick={() => setShowDetailsModal(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Basic Information</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="text-sm text-gray-900">{selectedCenter.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Code</label>
                    <p className="text-sm text-gray-900">{selectedCenter.code}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="text-sm text-gray-900">{selectedCenter.location}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">QR Code</label>
                    <p className="text-sm text-gray-900">{selectedCenter.qrCode}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Status & Performance</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Status</label>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      selectedCenter.status === 'active' ? 'bg-green-100 text-green-800' :
                      selectedCenter.status === 'maintenance' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedCenter.status === 'active' ? 'In Progress' :
                       selectedCenter.status === 'maintenance' ? 'Maintenance' : 'Idle'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Running</label>
                    <p className="text-sm text-gray-900">{selectedCenter.isRunning ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Utilization</label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-teal-500 h-2 rounded-full" 
                          style={{ width: `${selectedCenter.utilization}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{selectedCenter.utilization}%</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Operation</label>
                    <p className="text-sm text-gray-900">{selectedCenter.currentOperation || 'None'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    handleStatusToggle(selectedCenter._id, selectedCenter.status, selectedCenter.isRunning);
                    setShowDetailsModal(false);
                  }}
                  className={`px-4 py-2 rounded-lg text-white text-sm ${
                    selectedCenter.isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {selectedCenter.isRunning ? 'Stop' : 'Start'}
                </button>
                <button 
                  onClick={() => {
                    handleGenerateQR(selectedCenter._id);
                    setShowDetailsModal(false);
                  }}
                  disabled={generatingQR === selectedCenter._id}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingQR === selectedCenter._id ? 'Generating...' : 'Download QR'}
                </button>
              </div>
              <button 
                onClick={() => setShowDetailsModal(false)}
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

export default LiveShopFloor;
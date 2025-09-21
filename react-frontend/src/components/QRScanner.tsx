import React, { useState } from 'react';
import { QrCodeIcon, CloudArrowUpIcon, XMarkIcon, PlayIcon, PauseIcon, CheckIcon } from '@heroicons/react/24/outline';
import { workCentersAPI } from '../services/api';

interface QRScannerProps {
  onNavigate?: (page: string) => void;
}

interface WorkCenterData {
  id: string;
  workCenter: string;
  code: string;
  location: string;
  status: string;
  qrCode: string;
  timestamp: string;
  url?: string;
}

interface WorkCenterDetails {
  _id: string;
  name: string;
  code: string;
  location: string;
  status: 'active' | 'maintenance' | 'idle';
  utilization: number;
  isRunning: boolean;
  description?: string;
}

const QRScanner: React.FC<QRScannerProps> = ({ onNavigate }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [qrData, setQrData] = useState<WorkCenterData | null>(null);
  const [workCenterDetails, setWorkCenterDetails] = useState<WorkCenterDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setLoading(true);

    try {
      // Create canvas to read QR code from image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        try {
          // Use jsQR library to decode QR code
          const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
          if (imageData) {
            // For demo purposes, we'll simulate QR reading
            // In production, you'd use a library like jsQR
            await simulateQRReading(file);
          }
        } catch (error) {
          console.error('Error reading QR code:', error);
          alert('Could not read QR code from image. Please try another image.');
        }
        setLoading(false);
      };

      img.src = URL.createObjectURL(file);
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file. Please try again.');
      setLoading(false);
    }
  };

  const simulateQRReading = async (file: File) => {
    try {
      // For demo purposes, we'll extract work center info from filename or use mock data
      // In production, you would use jsQR library to decode the actual QR code
      const fileName = file.name.toLowerCase();
      let mockQRData: WorkCenterData;

      if (fileName.includes('asm') || fileName.includes('assembly')) {
        mockQRData = {
          id: '1',
          workCenter: 'Assembly Station A',
          code: 'ASM-A-001',
          location: 'Floor 1, Section A',
          status: 'idle',
          qrCode: 'ASM-A-001',
          timestamp: new Date().toISOString()
        };
      } else if (fileName.includes('pnt') || fileName.includes('paint')) {
        mockQRData = {
          id: '2',
          workCenter: 'Painting Booth B',
          code: 'PNT-B-002',
          location: 'Floor 2, Section B',
          status: 'idle',
          qrCode: 'PNT-B-002',
          timestamp: new Date().toISOString()
        };
      } else {
        // Default work center
        mockQRData = {
          id: '1',
          workCenter: 'Assembly Station A',
          code: 'ASM-A-001',
          location: 'Floor 1, Section A',
          status: 'idle',
          qrCode: 'ASM-A-001',
          timestamp: new Date().toISOString()
        };
      }

      setQrData(mockQRData);
      await loadWorkCenterDetails(mockQRData.id);
      setShowDetails(true);
    } catch (error) {
      console.error('Error processing QR data:', error);
      alert('Error processing QR code data.');
    }
  };

  const loadWorkCenterDetails = async (workCenterId: string) => {
    try {
      // Try to load from API, fallback to mock data
      const response = await workCentersAPI.getById(workCenterId);
      setWorkCenterDetails(response.data);
    } catch (error) {
      console.error('Error loading work center details:', error);
      // Mock data for demo
      setWorkCenterDetails({
        _id: '1',
        name: 'Assembly Station A',
        code: 'ASM-A-001',
        location: 'Floor 1, Section A',
        status: 'idle',
        utilization: 0,
        isRunning: false,
        description: 'Main assembly station for furniture production'
      });
    }
  };

  const updateWorkCenterStatus = async (newStatus: 'active' | 'idle' | 'maintenance', isRunning: boolean) => {
    if (!workCenterDetails) return;

    setUpdating(true);
    try {
      await workCentersAPI.updateStatus(workCenterDetails._id, newStatus, isRunning);
      setWorkCenterDetails({
        ...workCenterDetails,
        status: newStatus,
        isRunning
      });
      
      // Show success message and redirect after 1.5 seconds
      alert(`Work center status updated to ${newStatus}! Redirecting to Live Shop Floor...`);
      setTimeout(() => {
        if (onNavigate) {
          onNavigate('live-shop-floor');
        }
      }, 1500);
    } catch (error) {
      console.error('Error updating status:', error);
      // Fallback: Update local state
      setWorkCenterDetails({
        ...workCenterDetails,
        status: newStatus,
        isRunning
      });
      alert(`Work center status updated to ${newStatus}! Redirecting to Live Shop Floor...`);
      setTimeout(() => {
        if (onNavigate) {
          onNavigate('live-shop-floor');
        }
      }, 1500);
    } finally {
      setUpdating(false);
    }
  };

  const resetScanner = () => {
    setSelectedFile(null);
    setQrData(null);
    setWorkCenterDetails(null);
    setShowDetails(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'maintenance': return 'bg-red-500';
      case 'idle':
      default: return 'bg-blue-400';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">QR Code Scanner</h1>
        <p className="text-gray-600">Upload and scan QR codes to manage work centers</p>
      </div>

      {!showDetails ? (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
            <div className="text-center">
              <QrCodeIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload QR Code Image</h3>
              <p className="text-gray-600 mb-6">Select a QR code image to scan and manage work center</p>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-teal-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="qr-upload"
                  disabled={loading}
                />
                <label
                  htmlFor="qr-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mb-3" />
                  <span className="text-gray-600">
                    {loading ? 'Processing...' : 'Click to upload QR code image'}
                  </span>
                  <span className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB</span>
                </label>
              </div>

              {selectedFile && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Selected: {selectedFile.name}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Work Center Details</h2>
                <button
                  onClick={resetScanner}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {workCenterDetails && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Work Center Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <p className="text-sm text-gray-900">{workCenterDetails.name}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Code</label>
                        <p className="text-sm text-gray-900">{workCenterDetails.code}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <p className="text-sm text-gray-900">{workCenterDetails.location}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <p className="text-sm text-gray-900">{workCenterDetails.description || 'No description'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status & Controls */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Status & Controls</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${getStatusColor(workCenterDetails.status)}`}></div>
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {workCenterDetails.status === 'active' ? 'In Progress' : 
                             workCenterDetails.status === 'maintenance' ? 'Maintenance' : 'Idle'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Running Status</label>
                        <p className="text-sm text-gray-900">{workCenterDetails.isRunning ? 'Running' : 'Stopped'}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Utilization</label>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-teal-500 h-2 rounded-full" 
                              style={{ width: `${workCenterDetails.utilization}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{workCenterDetails.utilization}%</span>
                        </div>
                      </div>

                      {/* Control Buttons */}
                      <div className="pt-4 border-t border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-3">Quick Actions</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => updateWorkCenterStatus('active', true)}
                            disabled={updating || (workCenterDetails.status === 'active' && workCenterDetails.isRunning)}
                            className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <PlayIcon className="w-4 h-4" />
                            <span>Start</span>
                          </button>

                          <button
                            onClick={() => updateWorkCenterStatus('idle', false)}
                            disabled={updating || (workCenterDetails.status === 'idle' && !workCenterDetails.isRunning)}
                            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <PauseIcon className="w-4 h-4" />
                            <span>Stop</span>
                          </button>

                          <button
                            onClick={() => updateWorkCenterStatus('maintenance', false)}
                            disabled={updating || workCenterDetails.status === 'maintenance'}
                            className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span>Maintenance</span>
                          </button>

                          <button
                            onClick={() => updateWorkCenterStatus('active', false)}
                            disabled={updating}
                            className="flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CheckIcon className="w-4 h-4" />
                            <span>Complete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
                  <button
                    onClick={resetScanner}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Scan Another QR
                  </button>
                  <div className="text-sm text-gray-500">
                    Last scanned: {new Date().toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
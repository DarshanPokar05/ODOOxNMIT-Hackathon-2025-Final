import React, { useState, useEffect, useRef } from 'react';
import { 
  ChartBarIcon, 
  CogIcon, 
  ClipboardDocumentListIcon,
  BuildingOfficeIcon,
  ArchiveBoxIcon,
  DocumentTextIcon,
  PlusIcon,
  ArchiveBoxArrowDownIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  DocumentChartBarIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  hasIndicator?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate, onLogout }) => {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { id: 'manufacturing-orders', label: 'Manufacturing Orders', icon: ClipboardDocumentListIcon },
    { id: 'work-orders', label: 'Work Orders', icon: CogIcon },
    { id: 'live-shop-floor', label: 'Live Shop Floor', icon: BuildingOfficeIcon, hasIndicator: true },
    { id: 'bills-of-material', label: 'Bill of Materials', icon: DocumentTextIcon },
    { id: 'stock-ledger', label: 'Stock Ledger', icon: ArchiveBoxIcon },
  ];

  const masterDataItems = [
    { id: 'product-master', label: 'Product Master', icon: ArchiveBoxIcon },
    { id: 'work-centers', label: 'Work Centers', icon: BuildingOfficeIcon },
    { id: 'qr-scanner', label: 'QR Scanner', icon: DocumentTextIcon },
  ];

  const quickAccess = [
    { label: 'New Order', icon: PlusIcon },
    { label: 'Stock In', icon: ArchiveBoxArrowDownIcon },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm border-r border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
              <BuildingOfficeIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">ManufacturingOS</div>
              <div className="text-xs text-gray-500">Production Suite</div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="p-4">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors relative ${
                  currentPage === item.id
                    ? 'bg-teal-500 text-white'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <item.icon className={`w-5 h-5 ${
                  currentPage === item.id ? 'text-white' : 'text-gray-400'
                }`} />
                <div className={`text-sm font-medium ${
                  currentPage === item.id ? 'text-white' : 'text-gray-900'
                }`}>
                  {item.label}
                </div>
                {item.hasIndicator && (
                  <div className="w-2 h-2 bg-green-500 rounded-full ml-auto"></div>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Master Data Section */}
        <div className="p-4 border-t border-gray-200">
          <nav className="space-y-1">
            {masterDataItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors ${
                  currentPage === item.id
                    ? 'bg-teal-500 text-white'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <item.icon className={`w-5 h-5 ${
                  currentPage === item.id ? 'text-white' : 'text-gray-400'
                }`} />
                <div className={`text-sm font-medium ${
                  currentPage === item.id ? 'text-white' : 'text-gray-900'
                }`}>
                  {item.label}
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Profile Section */}
        <div className="p-4 border-t border-gray-200">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">BS</span>
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-gray-900">B S</div>
                <div className="text-xs text-gray-500">Operator</div>
              </div>
              <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${
                showProfileDropdown ? 'rotate-180' : ''
              }`} />
            </button>

            {showProfileDropdown && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                <button
                  onClick={() => {
                    onNavigate('my-profile');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">My Profile</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('profile-reports');
                    setShowProfileDropdown(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
                >
                  <DocumentChartBarIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Profile Reports</span>
                </button>
                <hr className="my-1" />
                {onLogout && (
                  <button
                    onClick={() => {
                      onLogout();
                      setShowProfileDropdown(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors text-red-600"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    <span className="text-sm">Logout</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>


      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentPage === 'dashboard' ? 'Production Dashboard' : currentPage.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                {currentPage === 'dashboard' ? 'Real-time overview of your manufacturing operations' : 'Manage your production workflow'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
              <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
              <div className="w-4 h-4 bg-teal-500 rounded-full"></div>
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
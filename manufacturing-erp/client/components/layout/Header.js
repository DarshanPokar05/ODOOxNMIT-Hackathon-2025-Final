// client/components/layout/Header.js
import { useState } from 'react';
import { FiUser, FiChevronDown, FiLogOut, FiSettings, FiFileText } from 'react-icons/fi';

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // This user data should come from your global state/auth context later
  const user = { name: "John Smith", email: "john@manufacturing.com", role: "Admin" };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6">
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 focus:outline-none"
        >
          <div className="bg-blue-600 text-white rounded-full h-9 w-9 flex items-center justify-center text-sm font-bold">
            {user.name.charAt(0)}
          </div>
          <span className="hidden sm:inline text-sm font-medium text-gray-700">{user.name}</span>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
            <div className="px-4 py-3 border-b">
              <p className="text-sm font-semibold text-gray-800">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
            <a href="#" className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <FiUser className="mr-2"/> Update Profile
            </a>
            <a href="#" className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <FiSettings className="mr-2"/> Change Password
            </a>
            <a href="#" className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <FiFileText className="mr-2"/> My Reports
            </a>
            <div className="border-t border-gray-100 my-1"></div>
            <a href="/login" className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
              <FiLogOut className="mr-2"/> Logout
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
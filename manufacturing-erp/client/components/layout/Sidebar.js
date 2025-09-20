// client/components/layout/Sidebar.js
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiGrid, FiPackage, FiCpu, FiList, FiTrendingUp, FiHardDrive } from 'react-icons/fi';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: FiGrid },
  { href: '/manufacturing-orders', label: 'Manufacturing Orders', icon: FiPackage },
  { href: '/work-orders', label: 'Work Orders', icon: FiCpu },
  { href: '/boms', label: 'BOMs', icon: FiList },
  { href: '/work-centers', label: 'Work Centers', icon: FiHardDrive },
  { href: '/stock-ledger', label: 'Stock Ledger', icon: FiTrendingUp },
  { href: '/reports', label: 'Reports', icon: FiTrendingUp },
];

const NavLink = ({ item }) => {
  const router = useRouter();
  const isActive = router.pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="mr-3 h-5 w-5" />
      {item.label}
    </Link>
  );
};

export default function Sidebar() {
  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">ManufactureERP</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink key={item.label} item={item} />
        ))}
      </nav>
    </aside>
  );
}
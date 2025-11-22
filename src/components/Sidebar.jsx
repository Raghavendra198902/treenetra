import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon,
  ChartBarIcon,
  MapIcon,
  DocumentTextIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { user, isAdmin } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Trees', href: '/trees', icon: MapIcon },
    { name: 'Species', href: '/species', icon: DocumentTextIcon },
    { name: 'Health Records', href: '/health-records', icon: HeartIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    ...(isAdmin ? [{ name: 'Users', href: '/users', icon: UserGroupIcon }] : []),
  ];

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-green-600">🌳 TreeNetra</h1>
        <p className="text-sm text-gray-500 mt-1">Tree Management</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-medium">
            {user?.fullName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">{user?.fullName}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

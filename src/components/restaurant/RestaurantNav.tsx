import React from 'react';
import { NavLink } from 'react-router-dom';
import { ClipboardList, Store, Book, Clock, Settings } from 'lucide-react';

const RestaurantNav = () => {
  return (
    <nav className="bg-white shadow rounded-lg">
      <div className="px-4 py-3">
        <div className="flex space-x-4">
          <NavLink
            to="/restaurant/dashboard"
            end
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-700 hover:bg-orange-50'
              }`
            }
          >
            <ClipboardList className="w-4 h-4 mr-2" />
            Orders
          </NavLink>

          <NavLink
            to="/restaurant/dashboard/profile"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-700 hover:bg-orange-50'
              }`
            }
          >
            <Store className="w-4 h-4 mr-2" />
            Profile
          </NavLink>

          <NavLink
            to="/restaurant/dashboard/menu"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-700 hover:bg-orange-50'
              }`
            }
          >
            <Book className="w-4 h-4 mr-2" />
            Menu
          </NavLink>

          <NavLink
            to="/restaurant/dashboard/history"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-700 hover:bg-orange-50'
              }`
            }
          >
            <Clock className="w-4 h-4 mr-2" />
            History
          </NavLink>

          <NavLink
            to="/restaurant/dashboard/settings"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-700 hover:bg-orange-50'
              }`
            }
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default RestaurantNav;
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingCart, Clock, Wallet } from 'lucide-react';

const CustomerNav = () => {
  return (
    <nav className="bg-white shadow rounded-lg">
      <div className="px-4 py-3">
        <div className="flex space-x-4">
          <NavLink
            to="/customer/dashboard"
            end
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-700 hover:bg-orange-50'
              }`
            }
          >
            <Home className="w-4 h-4 mr-2" />
            Restaurants
          </NavLink>
          
          <NavLink
            to="/customer/dashboard/cart"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-700 hover:bg-orange-50'
              }`
            }
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Cart
          </NavLink>

          <NavLink
            to="/customer/dashboard/orders"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-700 hover:bg-orange-50'
              }`
            }
          >
            <Clock className="w-4 h-4 mr-2" />
            Orders
          </NavLink>

          <NavLink
            to="/customer/dashboard/balance"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-700 hover:bg-orange-50'
              }`
            }
          >
            <Wallet className="w-4 h-4 mr-2" />
            Balance
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default CustomerNav;
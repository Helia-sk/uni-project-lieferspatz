import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ClipboardList, Store, Book, Clock, Settings, Wallet, Menu, X } from 'lucide-react';

const RestaurantNav = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { to: "/restaurant/dashboard", icon: ClipboardList, label: "Orders", exact: true },
    { to: "/restaurant/dashboard/profile", icon: Store, label: "Profile" },
    { to: "/restaurant/dashboard/menu", icon: Book, label: "Menu" },
    { to: "/restaurant/dashboard/history", icon: Clock, label: "History" },
    { to: "/restaurant/dashboard/balance", icon: Wallet, label: "Balance" },
    { to: "/restaurant/dashboard/settings", icon: Settings, label: "Settings" }
  ];

  return (
    <nav className="bg-white shadow rounded-lg">
      <div className="px-4 py-3">
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center px-3 py-2 rounded-md text-gray-700 hover:text-orange-500 hover:bg-orange-50"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden space-y-2 mt-2`}>
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.exact}
              onClick={() => setIsMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  isActive
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700 hover:bg-orange-50'
                }`
              }
            >
              <item.icon className="w-4 h-4 mr-2" />
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex md:flex-wrap gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                  isActive
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700 hover:bg-orange-50'
                }`
              }
            >
              <item.icon className="w-4 h-4 mr-2" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default RestaurantNav;
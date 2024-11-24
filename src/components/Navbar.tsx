import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Utensils className="h-8 w-8 text-orange-500" />
            <span className="text-2xl font-bold text-gray-900">Lieferspatz</span>
          </Link>
          
          <div className="flex space-x-4">
            <Link
              to="/restaurant/login"
              className="text-gray-700 hover:text-orange-500 px-3 py-2 rounded-md text-sm font-medium"
            >
              Restaurant Login
            </Link>
            <Link
              to="/customer/login"
              className="bg-orange-500 text-white hover:bg-orange-600 px-4 py-2 rounded-md text-sm font-medium"
            >
              Customer Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
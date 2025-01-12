import React from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Utensils } from 'lucide-react';
import apiClient from '../api';
import { useCart } from '../contexts/CartContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  // Check if the current pathname starts with the dashboard paths
  const isDashboard =
    location.pathname.startsWith('/restaurant/dashboard') ||
    location.pathname.startsWith('/customer/dashboard');

const handleLogout = async () => {
  try {
    // Clear the cart before logging out
    clearCart();
    
    const response = await apiClient.post('/api/logout', {}, { withCredentials: true });

    if (response.status === 200) {
      console.log('User logged out successfully');
      navigate('/'); // Use the already initialized navigate
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error during logout:', error.response?.data?.error || error.message);
    } else {
      console.error('Error during logout:', (error as Error).message);
    }
    alert('Failed to logout. Please try again.');
  }
};


  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo on the left */}
          <Link to="/" className="flex items-center space-x-2">
            <Utensils className="h-8 w-8 text-orange-500" />
            <span className="text-2xl font-bold text-gray-900">Lieferspatz</span>
          </Link>

          {/* Right side */}
          <div className="flex space-x-4 ml-auto">
            {isDashboard && (
              <button
                className="bg-orange-500 text-white hover:bg-orange-600 px-4 py-2 rounded-md text-sm font-medium"
                onClick={handleLogout}
              >
                Logout
              </button>
            )}
            {!isDashboard && (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

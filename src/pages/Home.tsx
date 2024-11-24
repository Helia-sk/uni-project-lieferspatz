import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Users } from 'lucide-react';

const Home = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
          <span className="block">Welcome to </span>
          <span className="block text-orange-500">Lieferspatz</span>
        </h1>
        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
          Your favorite local restaurants, delivered right to your door.
        </p>
      </div>

      <div className="mt-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="relative group">
            <Link
              to="/restaurant/login"
              className="relative block w-full rounded-lg p-12 text-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 border-2 border-gray-300"
            >
              <ChefHat className="mx-auto h-12 w-12 text-orange-500" />
              <span className="mt-4 block text-xl font-semibold text-gray-900">
                Restaurant Partners
              </span>
              <p className="mt-2 text-gray-500">
                Register your restaurant or log in to manage orders
              </p>
            </Link>
          </div>

          <div className="relative group">
            <Link
              to="/customer/login"
              className="relative block w-full rounded-lg p-12 text-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 border-2 border-gray-300"
            >
              <Users className="mx-auto h-12 w-12 text-orange-500" />
              <span className="mt-4 block text-xl font-semibold text-gray-900">
                Hungry?
              </span>
              <p className="mt-2 text-gray-500">
                Order delicious food from local restaurants
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin } from 'lucide-react';
import type { Restaurant } from '../../db/schema';
import { getRestaurants } from '../../api/db';

const RestaurantList: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const data = getRestaurants();
        setRestaurants(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load restaurants:', err);
        setError('Failed to load restaurants. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Available Restaurants</h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {restaurants.map((restaurant) => (
          <Link
            key={restaurant.id}
            to={`/customer/dashboard/restaurant/${restaurant.id}`}
            className="block hover:shadow-lg transition-shadow duration-200"
          >
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {restaurant.imageUrl ? (
                <img
                  src={restaurant.imageUrl}
                  alt={restaurant.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {restaurant.name}
                </h3>
                
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {restaurant.description}
                </p>
                
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <MapPin className="w-4 h-4 mr-1" />
                  {restaurant.postalCode}
                  
                  <Clock className="w-4 h-4 ml-4 mr-1" />
                  Open Now
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RestaurantList;
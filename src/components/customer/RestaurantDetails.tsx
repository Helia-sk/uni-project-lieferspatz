import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, MapPin, ShoppingCart, Check } from 'lucide-react';
import apiClient from '../../api';
import { useCart } from '../../contexts/CartContext';

interface Restaurant {
  id: number;
  name: string;
  street: string;
  postalCode: string;
  description: string;
  imageUrl: string;
}

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  isAvailable: boolean;
  restaurantId: number;  // Add this missing property
}


const getRestaurantById = async (id: number): Promise<Restaurant> => {
  const response = await apiClient.get<Restaurant>(`/api/restaurant_details/${id}`);
  return response.data;
};


const getMenuItems = async (restaurantId: number): Promise<MenuItem[]> => {
  const response = await apiClient.get<MenuItem[]>(`/api/restaurant_details/${restaurantId}/menu`);
  return response.data;
};

const RestaurantDetails: React.FC = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedItems, setAddedItems] = useState<Record<number, boolean>>({});
  const { addToCart } = useCart();

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        const restaurantData = await getRestaurantById(parseInt(id));
        setRestaurant(restaurantData);

        if (restaurantData) {
          const menuData = await getMenuItems(restaurantData.id);
          setMenuItems(menuData);
        }
      } catch (error) {
        console.error('Failed to load restaurant data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleAddToCart = (item: MenuItem) => {
    if (!restaurant) return;
  
    addToCart({
      ...item,
      restaurantId: restaurant.id,  // Ensure restaurantId is stored
    });
  
    setAddedItems(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [item.id]: false }));
    }, 2000);
  };
  

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Restaurant not found</p>
      </div>
    );
  }

 // Group menu items dynamically based on category
const categorizedMenuItems = menuItems.reduce((acc, item) => {
  if (!acc[item.category]) {
    acc[item.category] = [];
  }
  acc[item.category].push(item);
  return acc;
}, {} as Record<string, MenuItem[]>);


  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Restaurant Header */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="relative h-48 bg-orange-500">
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-3xl font-bold">{restaurant.name}</h1>
            <p className="mt-2 text-sm opacity-90">{restaurant.description}</p>
            <div className="mt-4 flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {restaurant.street}, {restaurant.postalCode}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Open Now
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Categories */}
      <div className="grid grid-cols-1 gap-6">
      {Object.entries(categorizedMenuItems).map(([category, items]) => items.length > 0 && (
          <div key={category} className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{category}</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                    <p className="mt-1 text-lg font-medium text-gray-900">
                      €{item.price.toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={() => handleAddToCart(item)}
                    className={`ml-4 p-3 rounded-full transition-colors flex items-center space-x-2
                      ${addedItems[item.id]
                        ? 'bg-green-500 text-white'
                        : 'text-orange-500 hover:bg-orange-50'
                      }`}
                  >
                    {addedItems[item.id] ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span className="text-sm font-medium">Added</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        <span className="text-sm font-medium">Add to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantDetails;
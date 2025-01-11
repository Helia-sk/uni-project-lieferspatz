import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, MapPin, ShoppingCart, Check } from 'lucide-react';
import apiClient from "../../api.ts";
import { useCart } from '../../contexts/CartContext';

const RestaurantDetails: React.FC = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedItems, setAddedItems] = useState<Record<number, boolean>>({});
  const { addToCart } = useCart();

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        console.log('Fetching restaurant details');
        const restaurantResponse = await apiClient.get(`/api/restaurants/nearby`, { withCredentials: true });
        setRestaurant(restaurantResponse.data);

        console.log('Fetching menu items');
        const menuResponse = await apiClient.get(`/api/customer/dashboard/restaurant/${id}/`, {
          withCredentials: true,
        });
        console.log('Menu response:', menuResponse.data);
        setMenuItems(menuResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleAddToCart = (item) => {
    addToCart(item);
    setAddedItems(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => setAddedItems(prev => ({ ...prev, [item.id]: false })), 2000);
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

  const categories = menuItems.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="relative h-48 bg-orange-500">
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-3xl font-bold">{restaurant.name}</h1>
            <p className="mt-2 text-sm">{restaurant.description}</p>
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

      <div className="grid grid-cols-1 gap-6">
        {Object.entries(categories).map(([category, items]) => (
          <div key={category} className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{category}</h2>
            {items.map(item => (
              <div key={item.id} className="flex justify-between p-4">
                <div>
                  <h3 className="text-lg">{item.name}</h3>
                  <p className="text-sm">{item.description}</p>
                  <p className="text-lg font-bold">€{item.price.toFixed(2)}</p>
                </div>
                <button onClick={() => handleAddToCart(item)}>
                  {addedItems[item.id] ? <Check /> : <ShoppingCart />}
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RestaurantDetails;

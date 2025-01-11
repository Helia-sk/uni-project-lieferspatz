import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { executeQuery } from '../../db';
import apiClient from '../../api';



const Cart: React.FC = () => {
  const { state, removeFromCart, updateQuantity, clearCart, total } = useCart();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();



  const handleSubmitOrder = async () => {
  if (!state.items?.length) {
    setError('Your cart is empty');
    return;
  }

  if (!state.restaurantId) {
    setError('Invalid restaurant ID');
    return;
  }

  setLoading(true);
  setError(null);

  try {
    // Calculate fees (15% platform fee)
    const platformFee = Number((total * 0.15).toFixed(2));
    const restaurantAmount = Number((total * 0.85).toFixed(2));
    const customerId = 1; // Example customer ID for testing

    const orderPayload = {
      customer_id: customerId,
      restaurant_id: state.restaurantId,
      items: state.items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      total: total,
      platform_fee: platformFee,
      restaurant_amount: restaurantAmount,
      notes: notes || '',
    };

    console.log('Sending order payload:', orderPayload);

    // Make the POST request without an Authorization header
   const response = await apiClient.post('/api/customer/dashboard/orders', orderPayload, {
      headers: { 'Content-Type': 'application/json' }, // Ensure the Content-Type header is set
    });

    console.log('Response from backend:', response.data);
    // Fetch updated order history after placing order
    const historyResponse = await apiClient.get('/api/customer/dashboard/orders/', {
      withCredentials: true, // Include session cookies
    });

    if (historyResponse.status === 200) {
      console.log('Updated order history:', historyResponse.data);

      // Redirect to OrderHistory page or pass the updated data
      navigate('/customer/dashboard/orders', {
        state: { orders: historyResponse.data }, // Pass orders as state
      });
    }
    // Clear cart and redirect to orders page
    clearCart();
    navigate('/customer/dashboard/orders');
  } catch (error) {
    console.error('Failed to submit order:', error);

    if (error.response) {
      // Error from the backend
      setError(error.response.data.error || 'Failed to place order');
    } else {
      // Network or other error
      setError('Failed to submit order');
    }
  } finally {
    setLoading(false);
  }
};




  // Check if cart is empty
  if (!state.items?.length) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">Your cart is empty</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>

      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6">
            <div className="space-y-4">
              {state.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-4 border-b last:border-0"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      €{item.price.toFixed(2)} each
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-1 text-gray-400 hover:text-orange-500 rounded-full hover:bg-orange-50"
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity(item.id, item.quantity - 1);
                          }
                        }}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-gray-900 w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        className="p-1 text-gray-400 hover:text-orange-500 rounded-full hover:bg-orange-50"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-lg font-medium text-gray-900 w-20 text-right">
                      €{(item.price * item.quantity).toFixed(2)}
                    </p>

                    <button
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700"
              >
                Special Instructions
              </label>
              <textarea
                id="notes"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests?"
              />
            </div>

            <div className="mt-6 border-t pt-6">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Subtotal</p>
                <p>€{total.toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <p>Platform Fee (15%)</p>
                <p>€{(total * 0.15).toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 mt-4">
                <p>Total</p>
                <p>€{total.toFixed(2)}</p>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <div className="mt-6">
              <button
                className="w-full bg-orange-500 text-white py-3 px-4 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                onClick={()=>{console.log('Place Order button clicked');
                handleSubmitOrder();
                console.log('After calling handleSubmitOrder');}}
                disabled={loading || !state.restaurantId}
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
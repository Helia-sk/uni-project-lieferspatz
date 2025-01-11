import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import apiClient from "../../api.ts"; // Assuming this is your API client

interface Order {
  id: number;
  status: 'processing' | 'preparing' | 'completed' | 'cancelled';
  total_amount: number;
  createdAt: string;
  notes?: string;
}

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      console.log("Fetching orders...");
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get('/api/customer/dashboard/orders/', {
          withCredentials: true, // Include session cookies
        });

        if (response.status === 200) {
          setOrders(response.data as Order[]); // Ensure correct typing
        } else {
          throw new Error('Failed to fetch orders');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
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

  // Active Orders (Processing & Preparing)
  const activeOrders = orders.filter(
    (order) => order.status === 'processing' || order.status === 'preparing'
  );

  // Past Orders (Completed first, Cancelled last)
  const pastOrders = orders
    .filter((order) => order.status === 'completed' || order.status === 'cancelled')
    .sort((a, b) => (a.status === 'cancelled' ? 1 : -1)); // Move 'cancelled' orders to the end

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Your Orders</h1>

      {/* Active Orders Section */}
      {activeOrders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Active Orders</h2>
          {activeOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      {/* Past Orders Section */}
      {pastOrders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Past Orders</h2>
          {pastOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      {/* No Orders */}
      {orders.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">No orders yet</p>
        </div>
      )}
    </div>
  );
};

const OrderCard = ({ order }: { order: Order }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Order #{order.id}
          </h3>
          <span
            className={`px-2 py-1 rounded-full text-sm font-medium ${
              order.status === 'completed'
                ? 'bg-green-100 text-green-800'
                : order.status === 'cancelled'
                ? 'bg-red-100 text-red-800'
                : 'bg-orange-100 text-orange-800'
            }`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        <div className="mt-4 flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-1" />
          {new Date(order.createdAt).toLocaleString()}
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium text-gray-900">
            Total: €{order.total_amount.toFixed(2)}
          </p>
        </div>

        {order.notes && (
          <div className="mt-4">
            <p className="text-sm text-gray-500">Notes: {order.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;

import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import apiClient from '../../api';
import useSocket from '../../hooks/useSocket';

interface Order {
  id: number;
  status: string;
  total_amount: number;
  restaurant_amount: number;
  platform_fee: number;
  notes?: string;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useSocket((data) => {
    setNotification('You have a new order!');
    setTimeout(() => setNotification(null), 5000); 
    fetchOrders(); 
  });

  const fetchOrders = async () => {
    try {
      const response = await apiClient.get('/api/orders');
      const fetchedOrders: Order[] = response.data as Order[];

      // Check for new orders
      if (orders.length > 0) {
        const newOrders = fetchedOrders.filter(
          (order: Order) => !orders.some((existingOrder) => existingOrder.id === order.id)
        );

        if (newOrders.length > 0) {
          setNotification(`You have ${newOrders.length} new order(s)!`);
          setTimeout(() => setNotification(null), 5000); //  5 seconds
        }
      }

      setOrders(fetchedOrders);
      setError(null);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError((error as any).message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch (Removed polling)
    fetchOrders();
  }, []); 

  const handleAcceptOrder = async (orderId: number) => {
    try {
      const response = await apiClient.post(`/api/orders/${orderId}/accept`, {}, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: 'preparing' } : order
          )
        );
        setNotification('Order accepted successfully.');
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      setError('Failed to accept order.');
    }
  };
  
  const handleRejectOrder = async (orderId: number) => {
    try {
      const response = await apiClient.post(`/api/orders/${orderId}/reject`, {}, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status === 200) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: 'canceled' } : order
          )
        );
        setNotification('Order rejected successfully.');
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (error) {
      console.error('Error rejecting order:', error);
      setError('Failed to reject order.');
    }
  };
  
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

  // Filter orders to include only those with status 'processing'
  const processingOrders = orders.filter(order => order.status === 'processing');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Active Orders</h1>

      {/* Notification */}
      {notification && (
        <div className="fixed top-5 right-5 bg-green-500 text-white py-2 px-4 rounded-lg shadow-lg z-50">
          {notification}
        </div>
      )}

      {processingOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Bell className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
          <p className="mt-1 text-sm text-gray-500">
            New orders will appear here when available
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {processingOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Order #{order.id}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-medium ${
                      order.status === 'processing'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-900">
                    Total: €{order.total_amount.toFixed(2)}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Restaurant Amount: €{order.restaurant_amount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Platform Fee: €{order.platform_fee.toFixed(2)}
                  </p>
                </div>

                {order.notes && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      Notes: {order.notes}
                    </p>
                  </div>
                )}

                {order.status === 'processing' && (
                  <div className="mt-6 flex space-x-3">
                    <button
                      onClick={() => handleAcceptOrder(order.id)}
                      className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectOrder(order.id)}
                      className="flex-1 bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
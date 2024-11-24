import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import type { Order } from '../../db/schema';

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Set up WebSocket connection for real-time updates
    // TODO: Fetch active orders
    setLoading(false);
  }, []);

  const handleAcceptOrder = async (orderId: number) => {
    // TODO: Accept order
  };

  const handleRejectOrder = async (orderId: number) => {
    // TODO: Reject order
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Active Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Bell className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
          <p className="mt-1 text-sm text-gray-500">
            New orders will appear here automatically
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
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
                    Total: €{order.totalAmount.toFixed(2)}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Restaurant Amount: €{order.restaurantAmount.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Platform Fee: €{order.platformFee.toFixed(2)}
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
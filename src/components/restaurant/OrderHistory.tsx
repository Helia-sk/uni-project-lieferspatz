import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import apiClient from '../../api';

interface Order {
  id: number;
  status: string;
  total_amount: number;
  restaurant_amount: number;
  platform_fee: number;
  notes?: string;
  created_at: string; // ISO timestamp
}

interface OrderDetails {
  id: number;
  status: string;
  total_amount: number;
  notes: string | null;
  customer: {
    first_name: string;
    last_name: string;
    address: string;
  };
  items: {
    name: string;
    quantity: number;
    price_at_order: number;
  }[];
}

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await apiClient.get('/api/orders');
        const fetchedOrders: Order[] = response.data;

        // Filter out processing orders and sort the remaining orders
        const filteredSortedOrders = fetchedOrders
          .filter((order) => order.status !== 'processing') // Exclude processing
          .sort((a, b) => {
            const statusOrder = ['preparing', 'completed', 'cancelled'];
            const statusComparison =
              statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
            if (statusComparison === 0) {
              // If statuses are the same, sort by timestamp
              return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            }
            return statusComparison;
          });

        setOrders(filteredSortedOrders);
        setError(null);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError((error as any).message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleDone = async (orderId: number) => {
    try {
      console.log(`Attempting to mark order ${orderId} as done`);
      await apiClient.post(
        `/api/orders/${orderId}/complete`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: 'completed' } : order
        )
      );
      console.log(`Order ${orderId} marked as completed successfully`);
    } catch (error) {
      console.error('Error marking order as done:', error);
      setError((error as any).message || 'Failed to update order status.');
    }
  };

  const fetchOrderDetails = async (orderId: number) => {
    try {
      console.log(`Fetching details for order ID: ${orderId}`);
      const response = await apiClient.get(`/api/orders/${orderId}/details`);
      console.log('Order details received from API:', response.data);
      setSelectedOrder(response.data);
      setModalOpen(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError((error as any).message || 'Failed to fetch order details.');
    }
  };
  

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'preparing':
        return 'bg-blue-500 text-white';
      case 'completed':
        return 'bg-green-500 text-white';
      case 'cancelled':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
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
      <h1 className="text-2xl font-bold text-gray-900">Order History</h1>

      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onViewDetails={() => fetchOrderDetails(order.id)}
          onDone={() => handleDone(order.id)}
          getStatusBadgeColor={getStatusBadgeColor}
        />
      ))}

      {modalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-lg max-w-lg w-full relative">
            <button
              onClick={() => setModalOpen(false)}
              className="text-red-500 hover:text-red-700 absolute top-2 right-2"
            >
              X
            </button>
            <div className="p-4">
              <h2 className="text-lg font-bold">Order #{selectedOrder.id}</h2>
              <p>Status: {selectedOrder.status}</p>
              <p>Total Amount: €{selectedOrder.total_amount.toFixed(2)}</p>
              <p>Notes: {selectedOrder.notes || 'None'}</p>
              <h3 className="text-md font-bold mt-4">Customer Details:</h3>
              <p>
                Name: {selectedOrder.customer.first_name}{' '}
                {selectedOrder.customer.last_name}
              </p>
              <p>Address: {selectedOrder.customer.address}</p>
              <h3 className="text-md font-bold mt-4">Order Items:</h3>
              <ul>
                {selectedOrder.items.map((item, index) => (
                  <li key={index}>
                    {item.quantity}x {item.name} - €{item.price_at_order.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const OrderCard = ({
  order,
  onViewDetails,
  onDone,
  getStatusBadgeColor,
}: {
  order: Order;
  onViewDetails: () => void;
  onDone: () => void;
  getStatusBadgeColor: (status: string) => string;
}) => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
    <div className="p-6 flex justify-between items-center">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Order #{order.id}</h3>
        <span
          className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
            order.status
          )}`}
        >
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <Clock className="w-4 h-4 mr-1" />
          {new Date(order.created_at).toLocaleString()}
        </div>
        {order.status === 'preparing' && (
          <div className="mt-4">
            <button
              onClick={onDone}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Done
            </button>
          </div>
        )}
      </div>
      <div>
        <button
          onClick={onViewDetails}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
        >
          View Details
        </button>
      </div>
    </div>
  </div>
);

export default OrderHistory;

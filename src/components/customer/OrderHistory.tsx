import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import apiClient from '../../api';

interface Order {
  id: number;
  status: 'processing' | 'preparing' | 'completed' | 'cancelled';
  total_amount: number;
  created_at: string;
  notes?: string;
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
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get('/api/orders');
        const fetchedOrders: Order[] = response.data;

        // Sort orders by creation date and status
        const sortedOrders = fetchedOrders.sort((a, b) => {
          const statusOrder = ['processing', 'preparing', 'completed', 'cancelled'];
          const statusComparison =
            statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);

          if (statusComparison === 0) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // Newest first
          }

          return statusComparison;
        });

        setOrders(sortedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError('No orders found yet');
      } finally {
        setLoading(false)
      }
    };

    fetchOrders();
  }, []);

  const fetchOrderDetails = async (orderId: number) => {
    try {
      const response = await apiClient.get(`/api/orders/${orderId}/details`);
      setSelectedOrder(response.data);
      setModalOpen(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to fetch order details.');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-orange-500 text-white';
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

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
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
          getStatusBadgeColor={getStatusBadgeColor}
        />
      ))}

      {modalOpen && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};

const OrderCard = ({
  order,
  onViewDetails,
  getStatusBadgeColor,
}: {
  order: Order;
  onViewDetails: () => void;
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
        <p className="mt-2 text-sm text-gray-900 font-semibold">
          Total: €{order.total_amount.toFixed(2)}
        </p>
      </div>
      <button
        onClick={onViewDetails}
        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
      >
        View Details
      </button>
    </div>
  </div>
);

const OrderDetailsModal = ({
  order,
  onClose,
}: {
  order: OrderDetails;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-4 shadow-lg max-w-lg w-full relative">
      <button
        onClick={onClose}
        className="text-red-500 hover:text-red-700 absolute top-2 right-2"
      >
        X
      </button>
      <div className="p-4">
        <h2 className="text-lg font-bold">Order #{order.id}</h2>
        <p>Status: {order.status}</p>
        <p>Total Amount: €{order.total_amount.toFixed(2)}</p>
        <p>Notes: {order.notes || 'None'}</p>
        <h3 className="text-md font-bold mt-4">Customer Details:</h3>
        <p>
          Name: {order.customer.first_name} {order.customer.last_name}
        </p>
        <p>Address: {order.customer.address}</p>
        <h3 className="text-md font-bold mt-4">Order Items:</h3>
        <ul>
          {order.items.map((item, index) => (
            <li key={index}>
              {item.quantity}x {item.name} - €{item.price_at_order.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

export default OrderHistory;

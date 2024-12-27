export interface Restaurant {
  id: number;
  name: string;
  street: string;
  postalCode: string;
  description: string;
  imageUrl?: string;
  passwordHash: string;
  balance: number;
}

export interface MenuItem {
  id: number;
  restaurantId: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
}

export interface OpeningHours {
  id: number;
  restaurantId: number;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  openTime: string;  // HH:mm format
  closeTime: string; // HH:mm format
}

export interface DeliveryArea {
  id: number;
  restaurantId: number;
  postalCode: string;
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  street: string;
  postalCode: string;
  passwordHash: string;
  balance: number;
}

export interface Order {
  id: number;
  customerId: number;
  restaurantId: number;
  status: 'processing' | 'preparing' | 'cancelled' | 'completed';
  totalAmount: number;
  platformFee: number;
  restaurantAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  menuItemId: number;
  quantity: number;
  priceAtOrder: number;
}

export interface Platform {
  id: number;
  balance: number;
}
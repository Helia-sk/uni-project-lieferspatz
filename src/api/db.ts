import { executeQuery } from '../db';
import type { Restaurant, MenuItem, Order } from '../db/schema';

export const getRestaurants = (): Restaurant[] => {
  return executeQuery(`
    SELECT DISTINCT r.* 
    FROM restaurants r
    INNER JOIN delivery_areas da ON r.id = da.restaurant_id
  `);
};

export const getRestaurantById = (id: number): Restaurant | null => {
  const results = executeQuery('SELECT * FROM restaurants WHERE id = ?', [id]);
  return results[0] || null;
};

export const getMenuItems = (restaurantId: number): MenuItem[] => {
  return executeQuery(
    'SELECT * FROM menu_items WHERE restaurant_id = ? AND is_available = 1',
    [restaurantId]
  );
};

export const getOrders = (restaurantId: number): Order[] => {
  return executeQuery(
    'SELECT * FROM orders WHERE restaurant_id = ? ORDER BY created_at DESC',
    [restaurantId]
  );
};

export const getCustomerOrders = (customerId: number): Order[] => {
  return executeQuery(
    'SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC',
    [customerId]
  );
};
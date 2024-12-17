-- Clear existing data
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM menu_items;
DELETE FROM opening_hours;
DELETE FROM delivery_areas;
DELETE FROM restaurants;
DELETE FROM customers;

-- Add test restaurants
INSERT INTO restaurants (id, name, street, postal_code, description, password_hash, balance)
VALUES 
(1, 'Bella Italia', 'Hauptstraße 1', '10115', 'Authentic Italian cuisine in the heart of the city', 'resto1', 0.00),
(2, 'Burger House', 'Friedrichstraße 2', '10117', 'Gourmet burgers and fresh ingredients', 'resto2', 0.00),
(3, 'Sushi Master', 'Kantstraße 3', '10623', 'Premium sushi and Japanese specialties', 'resto3', 0.00);

-- Add test customers
INSERT INTO customers (id, username, first_name, last_name, street, postal_code, password_hash, balance)
VALUES 
(1,'maxi2', 'Max', 'Mustermann', 'Alexanderplatz 1', '10178', 'user1', 100.00),
(2,'annasch', 'Anna', 'Schmidt', 'Potsdamer Platz 2', '10785', 'user2', 100.00),
(3,'leoni', 'Leon', 'Weber', 'Kurfürstendamm 3', '10719', 'user3', 100.00);

-- Add menu items for Bella Italia with a comprehensive Italian menu
INSERT INTO menu_items (restaurant_id, name, description, price, is_available)
VALUES 
-- Antipasti
(1, 'Bruschetta Classica', 'Toasted bread with fresh tomatoes, garlic, and basil', 6.99, true),
(1, 'Caprese', 'Fresh buffalo mozzarella with tomatoes and basil', 8.99, true),
(1, 'Antipasto Misto', 'Selection of Italian cured meats, cheeses, and marinated vegetables', 12.99, true),

-- Pizzas
(1, 'Margherita', 'Tomato sauce, fresh mozzarella, and basil', 11.99, true),
(1, 'Quattro Formaggi', 'Four cheese pizza with mozzarella, gorgonzola, parmesan, and fontina', 13.99, true),
(1, 'Diavola', 'Spicy salami, tomato sauce, and mozzarella', 12.99, true),
(1, 'Prosciutto e Funghi', 'Ham, mushrooms, tomato sauce, and mozzarella', 13.99, true),

-- Pasta
(1, 'Spaghetti Carbonara', 'Classic carbonara with eggs, pecorino cheese, guanciale, and black pepper', 14.99, true),
(1, 'Penne all''Arrabbiata', 'Spicy tomato sauce with garlic and red chili', 12.99, true),
(1, 'Lasagna alla Bolognese', 'Traditional lasagna with meat ragù and béchamel sauce', 15.99, true),
(1, 'Ravioli di Ricotta', 'Homemade ricotta-filled ravioli with sage butter sauce', 16.99, true),

-- Main Courses
(1, 'Osso Buco', 'Braised veal shanks with gremolata and saffron risotto', 24.99, true),
(1, 'Scaloppine al Limone', 'Veal escalopes in lemon sauce with capers', 22.99, true),

-- Desserts
(1, 'Tiramisu', 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone cream', 7.99, true),
(1, 'Panna Cotta', 'Vanilla panna cotta with berry coulis', 6.99, true),
(1, 'Cannoli Siciliani', 'Crispy pastry tubes filled with sweet ricotta cream', 6.99, true);

-- Add menu items for other restaurants
INSERT INTO menu_items (restaurant_id, name, description, price, is_available)
VALUES 
-- Burger House
(2, 'Classic Burger', 'Beef patty with lettuce, tomato, and cheese', 9.99, true),
(2, 'Veggie Burger', 'Plant-based patty with fresh vegetables', 11.99, true),
(2, 'Sweet Potato Fries', 'Crispy sweet potato fries', 4.99, true),

-- Sushi Master
(3, 'California Roll', 'Crab, avocado, and cucumber', 8.99, true),
(3, 'Salmon Nigiri', 'Fresh salmon on rice', 12.99, true),
(3, 'Miso Soup', 'Traditional Japanese soup', 3.99, true);

-- Add opening hours
INSERT INTO opening_hours (restaurant_id, day_of_week, open_time, close_time)
VALUES 
-- Bella Italia
(1, 0, '12:00', '22:00'), -- Sunday
(1, 1, '11:00', '23:00'), -- Monday
(1, 2, '11:00', '23:00'), -- Tuesday
(1, 3, '11:00', '23:00'), -- Wednesday
(1, 4, '11:00', '23:00'), -- Thursday
(1, 5, '11:00', '00:00'), -- Friday
(1, 6, '12:00', '00:00'), -- Saturday

-- Similar pattern for other restaurants
(2, 0, '11:00', '22:00'),
(2, 1, '11:00', '22:00'),
(2, 2, '11:00', '22:00'),
(2, 3, '11:00', '22:00'),
(2, 4, '11:00', '23:00'),
(2, 5, '11:00', '23:00'),
(2, 6, '11:00', '23:00'),

(3, 0, '12:00', '22:00'),
(3, 1, '11:30', '22:00'),
(3, 2, '11:30', '22:00'),
(3, 3, '11:30', '22:00'),
(3, 4, '11:30', '22:00'),
(3, 5, '11:30', '23:00'),
(3, 6, '12:00', '23:00');

-- Add delivery areas
INSERT INTO delivery_areas (restaurant_id, postal_code)
VALUES 
(1, '10115'),
(1, '10117'),
(1, '10119'),
(2, '10117'),
(2, '10115'),
(2, '10785'),
(3, '10623'),
(3, '10625'),
(3, '10719');

-- Create test orders with different statuses

-- Order 1: Processing order from Max at Bella Italia
INSERT INTO orders (id, customer_id, restaurant_id, status, total_amount, platform_fee, restaurant_amount, notes, created_at)
VALUES 
(1, 1, 1, 'processing', 53.96, 8.09, 45.87, 'Extra garlic bread would be great!', datetime('now', '-30 minutes'));

-- Order 2: Preparing order from Anna at Bella Italia
INSERT INTO orders (id, customer_id, restaurant_id, status, total_amount, platform_fee, restaurant_amount, notes, created_at)
VALUES 
(2, 2, 1, 'preparing', 42.97, 6.45, 36.52, 'Please make it extra spicy', datetime('now', '-20 minutes'));

-- Order 3: Completed order from Leon at Bella Italia
INSERT INTO orders (id, customer_id, restaurant_id, status, total_amount, platform_fee, restaurant_amount, notes, created_at)
VALUES 
(3, 3, 1, 'completed', 38.97, 5.85, 33.12, NULL, datetime('now', '-2 hours'));

-- Order 4: Cancelled order from Max at Bella Italia
INSERT INTO orders (id, customer_id, restaurant_id, status, total_amount, platform_fee, restaurant_amount, notes, created_at)
VALUES 
(4, 1, 1, 'cancelled', 29.98, 4.50, 25.48, 'Changed my mind', datetime('now', '-1 hour'));

-- Add items to Order 1 (Processing)
INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_order)
VALUES 
(1, 1, 1, 6.99),   -- Bruschetta Classica
(1, 8, 2, 14.99),  -- Two Spaghetti Carbonara
(1, 14, 1, 7.99);  -- Tiramisu

-- Add items to Order 2 (Preparing)
INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_order)
VALUES 
(2, 9, 2, 12.99),  -- Two Penne all'Arrabbiata
(2, 15, 1, 7.99),  -- Tiramisu
(2, 2, 1, 8.99);   -- Caprese

-- Add items to Order 3 (Completed)
INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_order)
VALUES 
(3, 4, 2, 11.99),  -- Two Margherita
(3, 16, 1, 6.99);  -- Panna Cotta

-- Add items to Order 4 (Cancelled)
INSERT INTO order_items (order_id, menu_item_id, quantity, price_at_order)
VALUES 
(4, 6, 2, 12.99);  -- Two Diavola

-- Update balances
UPDATE customers 
SET balance = balance - (
  SELECT COALESCE(SUM(total_amount), 0)
  FROM orders
  WHERE customer_id = customers.id
  AND status != 'cancelled'
);

UPDATE restaurants 
SET balance = balance + (
  SELECT COALESCE(SUM(restaurant_amount), 0)
  FROM orders
  WHERE restaurant_id = restaurants.id
  AND status != 'cancelled'
);

UPDATE platform 
SET balance = balance + (
  SELECT COALESCE(SUM(platform_fee), 0)
  FROM orders
  WHERE status != 'cancelled'
);
CREATE TABLE IF NOT EXISTS restaurants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  street TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  password_hash TEXT NOT NULL,
  balance DECIMAL(10,2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

CREATE TABLE IF NOT EXISTS opening_hours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TEXT NOT NULL,
  close_time TEXT NOT NULL,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  UNIQUE(restaurant_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS delivery_areas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL,
  postal_code TEXT NOT NULL,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  UNIQUE(restaurant_id, postal_code)
);

CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  street TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  balance DECIMAL(10,2) DEFAULT 100.00
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  restaurant_id INTEGER NOT NULL,
  status TEXT CHECK (status IN ('processing', 'preparing', 'cancelled', 'completed')) DEFAULT 'processing',
  total_amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  restaurant_amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  menu_item_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price_at_order DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

CREATE TABLE IF NOT EXISTS platform (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  balance DECIMAL(10,2) DEFAULT 0.00
);

-- Insert platform record
INSERT OR IGNORE INTO platform (id, balance) VALUES (1, 0.00);
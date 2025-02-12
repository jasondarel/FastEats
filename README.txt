Postgre :

-- Ensure the users table has authentication fields
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- Renamed from 'password' for consistency
    role TEXT NOT NULL DEFAULT 'user', -- Role field from auth_users
    address TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Ensure the restaurants table exists and has an owner reference
CREATE TABLE IF NOT EXISTS restaurants (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    owner_id INT REFERENCES users(id) ON DELETE CASCADE, -- Added owner reference
    status TEXT DEFAULT 'closed', -- 'open' or 'closed'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Ensure the menu_items table exists
CREATE TABLE IF NOT EXISTS menu_items (
    id SERIAL PRIMARY KEY,
    restaurant_id INT REFERENCES restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Ensure the orders table exists
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id INT REFERENCES restaurants(id) ON DELETE CASCADE,
    total_price DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'preparing', 'delivered'
    created_at TIMESTAMP DEFAULT NOW()
);

-- Ensure the order_items table exists
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INT REFERENCES menu_items(id) ON DELETE CASCADE,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);


Di api-gateway expressnya :
npm install express http-proxy-middleware cors dotenv

1. Ganti .env
2. npm install jsonwebtoken dotenv -> folder auth-service
3. npm install -g concurrently -> di folder project
4. npx concurrently "cd api-gateway && npm run dev" "cd auth-service && npm run dev" "cd user-service && npm run dev" "cd restaurant-service && npm run dev" "cd order-service && npm run dev"
// run semua sekaligus


-- Add customer role to users table
ALTER TABLE users MODIFY COLUMN role ENUM('admin','cashier','manager','customer') DEFAULT 'cashier';

-- Create MySQL user and grant permissions
CREATE USER IF NOT EXISTS 'user1'@'localhost' IDENTIFIED BY '12345678';
GRANT ALL PRIVILEGES ON sales_system.* TO 'user1'@'localhost';
FLUSH PRIVILEGES;

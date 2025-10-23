CREATE DATABASE IF NOT EXISTS sales_system;
USE sales_system;


CREATE TABLE users (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100) NOT NULL,
email VARCHAR(255) UNIQUE,
password_hash VARCHAR(255),
role ENUM('admin','cashier','manager') DEFAULT 'cashier',
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE products (
sku VARCHAR(50) PRIMARY KEY,
name VARCHAR(255) NOT NULL,
unit_price DECIMAL(10,2) NOT NULL,
stock INT DEFAULT 0
);


CREATE TABLE sales (
id INT AUTO_INCREMENT PRIMARY KEY,
user_id INT NOT NULL,
total DECIMAL(12,2) NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (user_id) REFERENCES users(id)
);


CREATE TABLE sale_items (
id INT AUTO_INCREMENT PRIMARY KEY,
sale_id INT NOT NULL,
product_sku VARCHAR(50) NOT NULL,
quantity INT NOT NULL,
unit_price DECIMAL(10,2) NOT NULL,
FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
FOREIGN KEY (product_sku) REFERENCES products(sku)
);


-- Don Macchiato Products
INSERT INTO products (sku, name, unit_price, stock) VALUES
('CARAMEL001','Caramel Macchiato',39.00,50),
('MATCHATOS001','Matchatos',39.00,50),
('DONYA001','Donya Berry',39.00,50),
('DARKO001','Darko Macchiato',39.00,50),
('MATCHABERRY001','Matcha Berry',39.00,50),
('OREO001','Oreo Macchiato',39.00,50),
('SPANISH001','Spanish Latte',39.00,50),
('BLACKFOREST001','Black Forest',39.00,50),
('PISTACIO001','Pistacio Macchiato',39.00,50);


-- sample user (password: password123)
-- generate the bcrypt hash in your backend; placeholder here
INSERT INTO users (name, email, password_hash, role) VALUES
('Cheska','cheska@gmail.com','$2b$10$p/pDuOuezSj4vCBmsPV3G.8VrwydV/zOtei3i9oSTUzu7nLaGIiHe', 'cashier');

INSERT INTO users (name, email, password_hash, role) VALUES
('Nino','lepasana@gmail.com','$2b$10$p/pDuOuezSj4vCBmsPV3G.8VrwydV/zOtei3i9oSTUzu7nLaGIiHe', 'admin');



INSERT INTO users (name, email, password_hash, role) VALUES
('Jeskha','derama@gmail.com','$2b$10$p/pDuOuezSj4vCBmsPV3G.8VrwydV/zOtei3i9oSTUzu7nLaGIiHe', 'manager');


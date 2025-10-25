use sales_db;

CREATE TABLE sale_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT,
    product_sku VARCHAR(50), -- references inventory system
    quantity INT,
    prod_name VARCHAR(100),
    price DECIMAL(10,2),
    FOREIGN KEY (sale_id) REFERENCES sales(id)
);


CREATE TABLE sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);


CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
);


INSERT INTO users (name) VALUES
('Alice Johnson'),
('Bob Smith'),
('Charlie Lee');


INSERT INTO sales (user_id, total) VALUES
(1, 25.00),
(2, 40.50),  
(1, 15.75);  


INSERT INTO sale_items (sale_id, product_sku, quantity, unit_price) VALUES
(1, 'DM-ICEDLATTE', 1, 39.00),
(1, 'DM-CARAMEL', 1, 39.00);
INSERT INTO sale_items (sale_id, product_sku, quantity, unit_price) VALUES
(2, 'DM-SPANLATTE', 1, 39.00),
(2, 'DM-VANILLA', 1, 39.00);

INSERT INTO sale_items (sale_id, product_sku, quantity, unit_price) VALUES
(3, 'DM-ICEDMACCHIATO', 1, 39.00);
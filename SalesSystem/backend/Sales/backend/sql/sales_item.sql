use sales_db;

CREATE TABLE sale_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT,
    product_sku VARCHAR(50), -- references inventory system
    quantity INT,
    unit_price DECIMAL(10,2),
    FOREIGN KEY (sale_id) REFERENCES sales(id)
);

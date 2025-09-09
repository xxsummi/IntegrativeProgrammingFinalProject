use sales_db;


INSERT INTO users (name) VALUES
('Alice Johnson'),
('Bob Smith'),
('Charlie Lee');


INSERT INTO sales (user_id, total) VALUES
(1, 25.00),   -- Alice makes a $25 sale
(2, 40.50),   -- Bob makes a $40.50 sale
(1, 15.75);   -- Alice makes another $15.75 sale


-- Sale 1 (Alice’s $25 sale)
INSERT INTO sale_items (sale_id, product_sku, quantity, unit_price) VALUES
(1, 'APPLE-001', 10, 0.50),   -- 10 apples @ $0.50 = $5.00
(1, 'MANGO-001', 5, 4.00);    -- 5 mangoes @ $4.00 = $20.00

-- Sale 2 (Bob’s $40.50 sale)
INSERT INTO sale_items (sale_id, product_sku, quantity, unit_price) VALUES
(2, 'BANANA-001', 30, 0.30),  -- 30 bananas @ $0.30 = $9.00
(2, 'ORANGE-001', 15, 2.10);  -- 15 oranges @ $2.10 = $31.50

-- Sale 3 (Alice’s second sale)
INSERT INTO sale_items (sale_id, product_sku, quantity, unit_price) VALUES
(3, 'APPLE-001', 15, 0.75);   -- 15 apples @ $0.75 = $11.25

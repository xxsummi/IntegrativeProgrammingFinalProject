-- Delete the products table
DROP TABLE products;

-- Delete the product_sku in sale_items table
ALTER TABLE sale_items DROP COLUMN product_sku;

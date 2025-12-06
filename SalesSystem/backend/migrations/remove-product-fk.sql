-- Remove foreign key constraint from sale_items to products
ALTER TABLE sale_items DROP FOREIGN KEY sale_items_ibfk_2;

-- Add product_name column to store product info without FK dependency
ALTER TABLE sale_items ADD COLUMN product_name VARCHAR(255) AFTER product_sku;

DROP VIEW IF EXISTS product_category_paths;
DROP FUNCTION IF EXISTS product_category_path(UUID);
DROP INDEX IF EXISTS idx_products_category_id;
ALTER TABLE products DROP COLUMN IF EXISTS category_id;
DROP TABLE IF EXISTS product_categories;

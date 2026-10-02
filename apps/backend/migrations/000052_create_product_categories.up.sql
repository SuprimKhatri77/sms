-- Product categories form a tree via parent_id, nested to any depth. Names
-- are unique among siblings (case-insensitive), so "Accessories" can live
-- under both "Men" and "Women"; the full path tells them apart.
CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID CONSTRAINT product_categories_parent_id_fkey REFERENCES product_categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT product_categories_not_own_parent CHECK (parent_id IS NULL OR parent_id <> id)
);

-- NULLs are distinct in a unique index, so a plain (parent_id, name) index
-- would let two top-level categories share a name. COALESCE puts every root
-- in the same bucket.
CREATE UNIQUE INDEX product_categories_sibling_name_key ON product_categories
    (COALESCE(parent_id, '00000000-0000-0000-0000-000000000000'::UUID), LOWER(name));
CREATE INDEX idx_product_categories_parent_id ON product_categories(parent_id);

ALTER TABLE products ADD COLUMN category_id UUID
    CONSTRAINT products_category_id_fkey REFERENCES product_categories(id) ON DELETE RESTRICT;
CREATE INDEX idx_products_category_id ON products(category_id);

-- Full path of a category, e.g. "Clothing › Men › Pants"; NULL for NULL.
-- Writes already prevent cycles, but the visited-id check and depth cap make
-- sure even corrupt data can never send the walk into an endless loop.
CREATE FUNCTION product_category_path(cat_id UUID) RETURNS TEXT
LANGUAGE sql STABLE AS $$
    WITH RECURSIVE up AS (
        SELECT c.id, c.parent_id, c.name, 1 AS depth, ARRAY[c.id] AS seen
        FROM product_categories c
        WHERE c.id = cat_id
        UNION ALL
        SELECT p.id, p.parent_id, p.name, up.depth + 1, up.seen || p.id
        FROM product_categories p
        JOIN up ON p.id = up.parent_id
        WHERE NOT p.id = ANY(up.seen) AND up.depth < 64
    )
    SELECT string_agg(name, ' › ' ORDER BY depth DESC) FROM up;
$$;

-- One row per category with its full path. Queries LEFT JOIN this instead of
-- calling the function directly so an uncategorised product comes back as
-- NULL (sqlc types a LEFT JOIN column as nullable).
CREATE VIEW product_category_paths AS
SELECT c.id AS category_id, product_category_path(c.id) AS path
FROM product_categories c;

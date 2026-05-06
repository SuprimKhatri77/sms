-- products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    unit TEXT NOT NULL DEFAULT 'pieces',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_name ON products(name);

-- stock_in (purchases / stock received)
CREATE TABLE stock_in (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    date TEXT NOT NULL,              -- BS date string e.g. "2081-01-15"
    invoice_no TEXT,                 -- supplier invoice/bill no, nullable
    qty INTEGER NOT NULL CHECK (qty > 0),
    rate INTEGER NOT NULL CHECK (rate > 0),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stock_in_product_id ON stock_in(product_id);
CREATE INDEX idx_stock_in_date ON stock_in(date);

-- stock_out (items distributed / given out)
CREATE TABLE stock_out (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    date TEXT NOT NULL,              -- BS date string
    bill_no TEXT,                    -- physical bill no for tracing back to student, nullable
    qty INTEGER NOT NULL CHECK (qty > 0),
    rate INTEGER NOT NULL CHECK (rate > 0),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stock_out_product_id ON stock_out(product_id);
CREATE INDEX idx_stock_out_date ON stock_out(date);
CREATE INDEX idx_stock_out_bill_no ON stock_out(bill_no);

-- wastage (damaged / lost items)
CREATE TABLE wastage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    date TEXT NOT NULL,              -- BS date string
    qty INTEGER NOT NULL CHECK (qty > 0),
    rate INTEGER NOT NULL CHECK (rate > 0),
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wastage_product_id ON wastage(product_id);
CREATE INDEX idx_wastage_date ON wastage(date);
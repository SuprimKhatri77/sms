CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name          VARCHAR NOT NULL,
    email         VARCHAR NOT NULL UNIQUE,
    password_hash VARCHAR NOT NULL,
    image_url     TEXT,
    role          VARCHAR NOT NULL DEFAULT 'user' CHECK (role IN("admin","superadmin","student")),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Initialize hnfzf database (database is already created by POSTGRES_DB)
-- No need to create database here, just use the existing one

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    images JSONB,
    product_url TEXT,
    price TEXT,
    brand TEXT,
    category TEXT,
    last_updated TEXT NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_product_id ON products(product_id);
CREATE INDEX IF NOT EXISTS idx_products_product_name ON products(product_name);
CREATE INDEX IF NOT EXISTS idx_products_last_updated ON products(last_updated);

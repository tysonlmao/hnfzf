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

-- Create product_flags table for additional product information
CREATE TABLE IF NOT EXISTS product_flags (
    id SERIAL PRIMARY KEY,
    sku TEXT NOT NULL UNIQUE,
    flag_type TEXT NOT NULL,
    flag_value TEXT,
    additional_data JSONB,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_product_id ON products(product_id);
CREATE INDEX IF NOT EXISTS idx_products_product_name ON products(product_name);
CREATE INDEX IF NOT EXISTS idx_products_last_updated ON products(last_updated);
CREATE INDEX IF NOT EXISTS idx_product_flags_sku ON product_flags(sku);
CREATE INDEX IF NOT EXISTS idx_product_flags_flag_type ON product_flags(flag_type);

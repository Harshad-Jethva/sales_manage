-- PostgreSQL Schema
-- Perfectly optimized for performance, integrity and scalability

-- 1. Create enumerated types for efficiency and check constraints
DO $$ BEGIN
    CREATE TYPE bank_transaction_type AS ENUM ('credit', 'debit');
    CREATE TYPE bill_record_type AS ENUM ('purchase', 'sale');
    CREATE TYPE bill_status_type AS ENUM ('pending', 'partial', 'paid');
    CREATE TYPE customer_role_type AS ENUM ('Regular', 'VIP', 'Wholesale');
    CREATE TYPE user_role_type AS ENUM ('admin', 'cashier', 'manager', 'accountant');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Trigger function to update `updated_at` column automatically
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop tables if exist
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bank_transactions CASCADE;
DROP TABLE IF EXISTS bill_items CASCADE;
DROP TABLE IF EXISTS bills CASCADE;
DROP TABLE IF EXISTS bank_accounts CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS external_stores CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Define Tables

CREATE TABLE bank_accounts (
    id SERIAL PRIMARY KEY,
    bank_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(50) NOT NULL UNIQUE,
    account_holder VARCHAR(255),
    balance NUMERIC(15,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_bank_accounts_balance ON bank_accounts(balance);

CREATE TABLE bank_transactions (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES bank_accounts(id) ON DELETE CASCADE,
    type bank_transaction_type NOT NULL,
    amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_bank_txn_account_date ON bank_transactions(account_id, transaction_date);

CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    company VARCHAR(255),
    type VARCHAR(50) DEFAULT 'Retail',
    shop_name VARCHAR(255),
    gstin VARCHAR(20),
    pan VARCHAR(20),
    billing_address TEXT,
    shipping_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    website VARCHAR(255),
    contact_person VARCHAR(255),
    notes TEXT,
    bank_name VARCHAR(255),
    account_number VARCHAR(50),
    ifsc_code VARCHAR(20),
    credit_limit NUMERIC(15,2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_email ON clients(email);

CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    shop_name VARCHAR(255),
    contact_person VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    website VARCHAR(255),
    gstin VARCHAR(20),
    pan VARCHAR(20),
    customer_type customer_role_type DEFAULT 'Regular',
    credit_limit NUMERIC(15,2) DEFAULT 0.00,
    address TEXT,
    billing_address TEXT,
    shipping_address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    bank_name VARCHAR(100),
    account_number VARCHAR(50),
    ifsc_code VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE INDEX idx_customers_phone ON customers(phone);

CREATE TABLE external_stores (
    id SERIAL PRIMARY KEY,
    store_name VARCHAR(255) NOT NULL,
    contact_info VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100) UNIQUE,
    hsn_code VARCHAR(20),
    description TEXT,
    category VARCHAR(100),
    brand VARCHAR(100),
    mrp NUMERIC(15,2) NOT NULL DEFAULT 0.00 CHECK (mrp >= 0),
    purchase_price NUMERIC(15,2) NOT NULL DEFAULT 0.00 CHECK (purchase_price >= 0),
    sale_price NUMERIC(15,2) NOT NULL DEFAULT 0.00 CHECK (sale_price >= 0),
    distributor_price NUMERIC(15,2) DEFAULT 0.00,
    gst_percent NUMERIC(5,2) DEFAULT 0.00,
    stock_quantity NUMERIC(15,2) DEFAULT 0.00,
    unit VARCHAR(20) DEFAULT 'pcs',
    min_stock_alert INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_stock ON products(stock_quantity);

CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    supplier_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    gst_number VARCHAR(50),
    pan_number VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    credit_period_days INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role user_role_type DEFAULT 'cashier',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bills (
    id SERIAL PRIMARY KEY,
    bill_type bill_record_type NOT NULL DEFAULT 'sale',
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    external_store_id INTEGER REFERENCES external_stores(id) ON DELETE SET NULL,
    customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
    supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL,
    bill_number VARCHAR(50) UNIQUE,
    sub_total NUMERIC(15,2) DEFAULT 0.00,
    discount_amount NUMERIC(15,2) DEFAULT 0.00,
    tax_amount NUMERIC(15,2) DEFAULT 0.00,
    total_amount NUMERIC(15,2) NOT NULL,
    paid_amount NUMERIC(15,2) DEFAULT 0.00,
    status bill_status_type DEFAULT 'pending',
    payment_method VARCHAR(50) DEFAULT 'Cash',
    bill_date DATE NOT NULL,
    bill_image VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_bills_client ON bills(client_id);
CREATE INDEX idx_bills_customer ON bills(customer_id);
CREATE INDEX idx_bills_supplier ON bills(supplier_id);
CREATE INDEX idx_bills_store ON bills(external_store_id);
CREATE INDEX idx_bills_date ON bills(bill_date);

CREATE TABLE bill_items (
    id SERIAL PRIMARY KEY,
    bill_id INTEGER REFERENCES bills(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    item_code VARCHAR(100),
    barcode VARCHAR(100),
    item_name VARCHAR(255) NOT NULL,
    mrp NUMERIC(15,2) DEFAULT 0.00,
    regular_discount_percent NUMERIC(5,2) DEFAULT 0.00,
    special_discount_percent NUMERIC(5,2) DEFAULT 0.00,
    gst_percent NUMERIC(5,2) DEFAULT 0.00,
    price_after_discount NUMERIC(15,2) NOT NULL,
    selling_price NUMERIC(15,2) DEFAULT 0.00,
    quantity NUMERIC(15,2) NOT NULL,
    total NUMERIC(15,2) NOT NULL,
    total_selling_price NUMERIC(15,2) DEFAULT 0.00
);
CREATE INDEX idx_bill_items_bill ON bill_items(bill_id);
CREATE INDEX idx_bill_items_product ON bill_items(product_id);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    bill_id INTEGER REFERENCES bills(id) ON DELETE SET NULL,
    amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(50),
    bank_account_id INTEGER REFERENCES bank_accounts(id) ON DELETE SET NULL,
    payment_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_payments_client ON payments(client_id);
CREATE INDEX idx_payments_bill ON payments(bill_id);
CREATE INDEX idx_payments_date ON payments(payment_date);

-- Insert original data
INSERT INTO users (id, name, username, password, role, created_at) VALUES
(1, 'System Admin', 'admin', '$2y$10$wN3/7Fz7r2.P.X.K.j.u..j.u..j.u..j.u..j.u..j.u..', 'admin', '2026-02-20 07:31:13'),
(2, 'Counter Staff', 'cashier', '$2y$10$wN3/7Fz7r2.P.X.K.j.u..j.u..j.u..j.u..j.u..j.u..', 'cashier', '2026-02-20 07:31:13'),
(3, 'Account Manager', 'accountant', '$2y$10$wN3/7Fz7r2.P.X.K.j.u..j.u..j.u..j.u..j.u..j.u..', 'accountant', '2026-02-20 07:31:13');

-- Ensure serial sequence correctly updated after manual inserts
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

INSERT INTO clients (id, name, phone, email, address, company, type, created_at, updated_at) VALUES
(1, 'fwfw', '8866995522', 'harshadjethva2115@gmail.com', 'ewewewew', '', 'Wholesale', '2026-02-17 05:59:04', '2026-02-17 05:59:04');

SELECT setval('clients_id_seq', (SELECT MAX(id) FROM clients));

-- Dummy supplier to satisfy constraints for bills
INSERT INTO suppliers (id, supplier_name) VALUES (1, 'Initial Supplier') ON CONFLICT DO NOTHING;
SELECT setval('suppliers_id_seq', (SELECT MAX(id) FROM suppliers));

INSERT INTO bills (id, bill_type, client_id, external_store_id, bill_number, sub_total, discount_amount, tax_amount, total_amount, paid_amount, status, payment_method, bill_date, bill_image, notes, created_at, customer_id, supplier_id) VALUES
(9, 'purchase', NULL, NULL, 'PUR-501665', 40.00, 0.00, 0.00, 47.20, 47.20, 'paid', 'Cash', '2026-02-17', 'uploads/bills/1771310375_bjp.jpeg', '', '2026-02-17 06:39:35', NULL, 1),
(10, 'purchase', NULL, NULL, 'PUR-964519', 510.60, 0.00, 0.00, 602.51, 602.51, 'paid', 'Cash', '2026-02-17', 'uploads/bills/1771310490_bjp.jpeg', '', '2026-02-17 06:41:30', NULL, 1),
(11, 'purchase', NULL, NULL, 'PUR-627475', 16698.00, 0.00, 0.00, 19703.64, 19703.64, 'paid', 'UPI', '2026-02-17', '', '', '2026-02-17 06:58:43', NULL, 1),
(12, 'purchase', NULL, NULL, 'PUR-253698', 20700.00, 0.00, 0.00, 24426.00, 24426.00, 'paid', 'Bank', '2026-02-17', '', '', '2026-02-17 07:01:48', NULL, 1),
(13, 'purchase', NULL, NULL, 'PUR-761808', 1620.00, 0.00, 0.00, 1911.60, 1911.60, 'paid', 'Cash', '2026-02-18', '', '', '2026-02-18 04:36:29', NULL, 1);

SELECT setval('bills_id_seq', (SELECT MAX(id) FROM bills));

-- PostgreSQL Database Schema for Sales Management

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bill_items CASCADE;
DROP TABLE IF EXISTS bank_transactions CASCADE;
DROP TABLE IF EXISTS bills CASCADE;
DROP TABLE IF EXISTS bank_accounts CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS external_stores CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- --------------------------------------------------------

-- Table structure for table bank_accounts
CREATE TABLE bank_accounts (
  id SERIAL PRIMARY KEY,
  bank_name VARCHAR(255) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  account_holder VARCHAR(255) DEFAULT NULL,
  balance NUMERIC(15,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_account_number UNIQUE (account_number)
);

-- --------------------------------------------------------

-- Table structure for table bank_transactions
CREATE TABLE bank_transactions (
  id SERIAL PRIMARY KEY,
  account_id INTEGER DEFAULT NULL,
  type VARCHAR(10) CHECK (type IN ('credit', 'debit')) NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  description TEXT DEFAULT NULL,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bank_transactions_account FOREIGN KEY (account_id) REFERENCES bank_accounts (id) ON DELETE CASCADE
);

-- --------------------------------------------------------

-- Table structure for table clients
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  company VARCHAR(255) DEFAULT NULL,
  type VARCHAR(50) DEFAULT 'Retail',
  shop_name VARCHAR(255) DEFAULT NULL,
  gstin VARCHAR(20) DEFAULT NULL,
  pan VARCHAR(20) DEFAULT NULL,
  billing_address TEXT DEFAULT NULL,
  shipping_address TEXT DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  state VARCHAR(100) DEFAULT NULL,
  pincode VARCHAR(10) DEFAULT NULL,
  website VARCHAR(255) DEFAULT NULL,
  contact_person VARCHAR(255) DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  bank_name VARCHAR(255) DEFAULT NULL,
  account_number VARCHAR(50) DEFAULT NULL,
  ifsc_code VARCHAR(20) DEFAULT NULL,
  credit_limit NUMERIC(15,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO clients (name, phone, email, address, company, type, created_at, updated_at) VALUES
('fwfw', '8866995522', 'harshadjethva2115@gmail.com', 'ewewewew', '', 'Wholesale', '2026-02-17 05:59:04', '2026-02-17 05:59:04');

-- --------------------------------------------------------

-- Table structure for table customers
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255) DEFAULT NULL,
  shop_name VARCHAR(255) DEFAULT NULL,
  contact_person VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) DEFAULT NULL,
  website VARCHAR(255) DEFAULT NULL,
  gstin VARCHAR(20) DEFAULT NULL,
  pan VARCHAR(20) DEFAULT NULL,
  customer_type VARCHAR(20) CHECK (customer_type IN ('Regular', 'VIP', 'Wholesale')) DEFAULT 'Regular',
  credit_limit NUMERIC(15,2) DEFAULT 0.00,
  address TEXT DEFAULT NULL,
  billing_address TEXT DEFAULT NULL,
  shipping_address TEXT DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  state VARCHAR(100) DEFAULT NULL,
  pincode VARCHAR(10) DEFAULT NULL,
  bank_name VARCHAR(100) DEFAULT NULL,
  account_number VARCHAR(50) DEFAULT NULL,
  ifsc_code VARCHAR(20) DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------

-- Table structure for table external_stores
CREATE TABLE external_stores (
  id SERIAL PRIMARY KEY,
  store_name VARCHAR(255) NOT NULL,
  contact_info VARCHAR(255) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------

-- Table structure for table suppliers
CREATE TABLE suppliers (
  id SERIAL PRIMARY KEY,
  supplier_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL,
  gst_number VARCHAR(50) DEFAULT NULL,
  pan_number VARCHAR(20) DEFAULT NULL,
  address TEXT DEFAULT NULL,
  city VARCHAR(100) DEFAULT NULL,
  state VARCHAR(100) DEFAULT NULL,
  credit_period_days INTEGER DEFAULT 30,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO suppliers (id, supplier_name, contact_person, phone, email, gst_number, pan_number, address, city, state, credit_period_days, created_at) VALUES
(1, 'Default Supplier', 'John Doe', '1234567890', 'supplier@example.com', 'GST12345', 'PAN12345', '123 Supplier St', 'CityName', 'StateName', 30, '2026-02-17 05:59:04');
SELECT setval('suppliers_id_seq', (SELECT MAX(id) FROM suppliers));

-- --------------------------------------------------------

-- Table structure for table bills
CREATE TABLE bills (
  id SERIAL PRIMARY KEY,
  bill_type VARCHAR(20) CHECK (bill_type IN ('purchase', 'sale')) NOT NULL DEFAULT 'sale',
  client_id INTEGER DEFAULT NULL,
  external_store_id INTEGER DEFAULT NULL,
  customer_id INTEGER DEFAULT NULL,
  supplier_id INTEGER DEFAULT NULL,
  bill_number VARCHAR(50) DEFAULT NULL,
  sub_total NUMERIC(15,2) DEFAULT 0.00,
  discount_amount NUMERIC(15,2) DEFAULT 0.00,
  tax_amount NUMERIC(15,2) DEFAULT 0.00,
  total_amount NUMERIC(15,2) NOT NULL,
  paid_amount NUMERIC(15,2) DEFAULT 0.00,
  status VARCHAR(20) CHECK (status IN ('pending', 'partial', 'paid')) DEFAULT 'pending',
  payment_method VARCHAR(50) DEFAULT 'Cash',
  bill_date DATE NOT NULL,
  bill_image VARCHAR(255) DEFAULT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_bill_number UNIQUE (bill_number),
  CONSTRAINT fk_bills_client FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
  CONSTRAINT fk_bills_external_store FOREIGN KEY (external_store_id) REFERENCES external_stores (id) ON DELETE SET NULL,
  CONSTRAINT fk_bills_customer FOREIGN KEY (customer_id) REFERENCES customers (id) ON DELETE SET NULL,
  CONSTRAINT fk_bills_supplier FOREIGN KEY (supplier_id) REFERENCES suppliers (id) ON DELETE SET NULL
);

INSERT INTO bills (id, bill_type, client_id, external_store_id, bill_number, sub_total, discount_amount, tax_amount, total_amount, paid_amount, status, payment_method, bill_date, bill_image, notes, created_at, customer_id, supplier_id) VALUES
(9, 'purchase', NULL, NULL, 'PUR-501665', 40.00, 0.00, 0.00, 47.20, 47.20, 'paid', 'Cash', '2026-02-17', 'uploads/bills/1771310375_bjp.jpeg', '', '2026-02-17 06:39:35', NULL, 1),
(10, 'purchase', NULL, NULL, 'PUR-964519', 510.60, 0.00, 0.00, 602.51, 602.51, 'paid', 'Cash', '2026-02-17', 'uploads/bills/1771310490_bjp.jpeg', '', '2026-02-17 06:41:30', NULL, 1),
(11, 'purchase', NULL, NULL, 'PUR-627475', 16698.00, 0.00, 0.00, 19703.64, 19703.64, 'paid', 'UPI', '2026-02-17', '', '', '2026-02-17 06:58:43', NULL, 1),
(12, 'purchase', NULL, NULL, 'PUR-253698', 20700.00, 0.00, 0.00, 24426.00, 24426.00, 'paid', 'Bank', '2026-02-17', '', '', '2026-02-17 07:01:48', NULL, 1),
(13, 'purchase', NULL, NULL, 'PUR-761808', 1620.00, 0.00, 0.00, 1911.60, 1911.60, 'paid', 'Cash', '2026-02-18', '', '', '2026-02-18 04:36:29', NULL, 1);
SELECT setval('bills_id_seq', (SELECT MAX(id) FROM bills));

-- --------------------------------------------------------

-- Table structure for table payments
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  client_id INTEGER DEFAULT NULL,
  bill_id INTEGER DEFAULT NULL,
  amount NUMERIC(15,2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT NULL,
  bank_account_id INTEGER DEFAULT NULL,
  payment_date DATE NOT NULL,
  notes TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_client FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
  CONSTRAINT fk_payments_bill FOREIGN KEY (bill_id) REFERENCES bills (id) ON DELETE SET NULL,
  CONSTRAINT fk_payments_bank_account FOREIGN KEY (bank_account_id) REFERENCES bank_accounts (id) ON DELETE SET NULL
);

-- --------------------------------------------------------

-- Table structure for table products
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) DEFAULT NULL,
  barcode VARCHAR(100) DEFAULT NULL,
  hsn_code VARCHAR(20) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  category VARCHAR(100) DEFAULT NULL,
  brand VARCHAR(100) DEFAULT NULL,
  mrp NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  purchase_price NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  sale_price NUMERIC(15,2) NOT NULL DEFAULT 0.00,
  distributor_price NUMERIC(15,2) DEFAULT 0.00,
  gst_percent NUMERIC(5,2) DEFAULT 0.00,
  stock_quantity NUMERIC(15,2) DEFAULT 0.00,
  unit VARCHAR(20) DEFAULT 'pcs',
  min_stock_alert INTEGER DEFAULT 5,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_sku UNIQUE (sku),
  CONSTRAINT unique_barcode UNIQUE (barcode)
);

-- --------------------------------------------------------

-- Table structure for table users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('admin', 'cashier', 'manager', 'accountant')) DEFAULT 'cashier',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_username UNIQUE (username)
);

INSERT INTO users (id, name, username, password, role, created_at) VALUES
(1, 'System Admin', 'admin', '$2y$10$wN3/7Fz7r2.P.X.K.j.u..j.u..j.u..j.u..j.u..j.u..', 'admin', '2026-02-20 07:31:13'),
(2, 'Counter Staff', 'cashier', '$2y$10$wN3/7Fz7r2.P.X.K.j.u..j.u..j.u..j.u..j.u..j.u..', 'cashier', '2026-02-20 07:31:13'),
(3, 'Account Manager', 'accountant', '$2y$10$wN3/7Fz7r2.P.X.K.j.u..j.u..j.u..j.u..j.u..j.u..', 'accountant', '2026-02-20 07:31:13');
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- --------------------------------------------------------

-- Create function and trigger for `updated_at` timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_modified_column();

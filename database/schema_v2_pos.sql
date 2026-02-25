-- Enterprise-Grade POS Database Schema (PostgreSQL)

-- Drop existing tables (if needed for fresh start)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS invoice_taxes CASCADE;
DROP TABLE IF EXISTS tax_details CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- 1. Clients Table
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    company VARCHAR(255),
    gstin VARCHAR(20),
    client_type VARCHAR(50) DEFAULT 'Retail', -- Retail, Wholesale, Corporate
    
    -- Additional Work Info
    shop_name VARCHAR(255),
    website VARCHAR(255),
    contact_person VARCHAR(255),
    
    -- Tax & Billing
    pan VARCHAR(20),
    billing_address TEXT,
    shipping_address TEXT,
    
    -- Bank Account Details
    bank_name VARCHAR(255),
    account_number VARCHAR(50),
    ifsc_code VARCHAR(20),
    
    -- Location
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    notes TEXT,

    credit_limit NUMERIC(15,2) DEFAULT 0.00,
    outstanding_balance NUMERIC(15,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active',
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_name ON clients(name);

-- 2. Invoices Table (Master)
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    
    -- Financials
    sub_total NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    total_discount NUMERIC(15,2) DEFAULT 0.00,
    total_tax NUMERIC(15,2) DEFAULT 0.00,
    shipping_charges NUMERIC(15,2) DEFAULT 0.00,
    grand_total NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(15,2) DEFAULT 0.00,
    
    -- Status
    payment_status VARCHAR(20) CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded')) DEFAULT 'unpaid',
    invoice_status VARCHAR(20) CHECK (invoice_status IN ('draft', 'confirmed', 'cancelled')) DEFAULT 'draft',
    
    -- Logistics & Notes
    shipping_address TEXT,
    notes TEXT,
    terms_conditions TEXT,
    
    -- Audit
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_status ON invoices(payment_status, invoice_status);

-- 3. Invoice Items Table (Transactional)
CREATE TABLE invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
    product_id INTEGER, -- Can link to a products table
    item_code VARCHAR(100),
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    
    quantity NUMERIC(15,3) NOT NULL,
    unit_price NUMERIC(15,2) NOT NULL,
    
    discount_percent NUMERIC(5,2) DEFAULT 0.00,
    discount_amount NUMERIC(15,2) DEFAULT 0.00,
    
    tax_percent NUMERIC(5,2) DEFAULT 0.00,
    tax_amount NUMERIC(15,2) DEFAULT 0.00,
    
    total_price NUMERIC(15,2) NOT NULL, -- (qty * unit_price) - discount + tax
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_product ON invoice_items(product_id);

-- 4. Payments Table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    
    payment_number VARCHAR(50) UNIQUE,
    amount NUMERIC(15,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- Cash, Card, UPI, NetBanking, Credit Account
    transaction_reference VARCHAR(255), -- e.g. UPI Ref, Check No
    
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'completed', -- completed, pending, failed
    notes TEXT,
    
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_client ON payments(client_id);
CREATE INDEX idx_payments_date ON payments(payment_date);

-- 5. Tax Details (Master for multiple tax types e.g. CGST, SGST, IGST)
CREATE TABLE tax_details (
    id SERIAL PRIMARY KEY,
    tax_name VARCHAR(50) NOT NULL, -- e.g., CGST, SGST, VAT
    tax_rate NUMERIC(5,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Invoice Taxes (Mapping table for detailed tax reporting)
CREATE TABLE invoice_taxes (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER REFERENCES invoices(id) ON DELETE CASCADE,
    tax_id INTEGER REFERENCES tax_details(id),
    tax_amount NUMERIC(15,2) NOT NULL
);
CREATE INDEX idx_invoice_taxes_invoice ON invoice_taxes(invoice_id);

-- 7. Audit Logs for Security
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    action VARCHAR(255) NOT NULL,
    table_name VARCHAR(100),
    record_id INTEGER,
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_clients_updated 
BEFORE UPDATE ON clients 
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE TRIGGER trg_invoices_updated 
BEFORE UPDATE ON invoices 
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

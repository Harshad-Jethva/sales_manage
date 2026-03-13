-- Stability and integrity hardening migration (PostgreSQL)
-- Safe to run multiple times.

BEGIN;

-- Auth and user lookups
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_username ON users (username);
CREATE INDEX IF NOT EXISTS idx_users_session_token ON users (session_token) WHERE session_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_role_status ON users (role, account_status);

-- POS and billing workloads
CREATE INDEX IF NOT EXISTS idx_bills_client_date ON bills (client_id, bill_date DESC);
CREATE INDEX IF NOT EXISTS idx_bills_status_date ON bills (status, bill_date DESC);
CREATE INDEX IF NOT EXISTS idx_bills_payment_method ON bills (payment_method);
CREATE INDEX IF NOT EXISTS idx_bill_items_bill_id ON bill_items (bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_items_product_id ON bill_items (product_id);

-- Route and delivery
CREATE INDEX IF NOT EXISTS idx_route_plans_salesman_date ON route_plans (salesman_id, route_date DESC);
CREATE INDEX IF NOT EXISTS idx_route_clients_route_id ON route_clients (route_id);
CREATE INDEX IF NOT EXISTS idx_route_clients_client_id ON route_clients (client_id);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_person_status ON delivery_orders (delivery_person_id, delivery_status);
CREATE INDEX IF NOT EXISTS idx_delivery_tracking_person_time ON delivery_tracking (delivery_person_id, created_at DESC);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_sender_created ON notifications (sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_user_state ON notification_recipients (user_id, is_read, status);
CREATE UNIQUE INDEX IF NOT EXISTS uq_notification_recipient ON notification_recipients (notification_id, user_id);

-- Cash handover and accounts
CREATE INDEX IF NOT EXISTS idx_cash_handovers_date_counter ON cash_handovers (handover_date, counter_name);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_account_date ON bank_transactions (account_id, transaction_date DESC);

COMMIT;

-- Optional stronger integrity: prevent duplicate routes for same salesman/date.
-- Only run this block after deduplicating conflicting rows (if any).
-- CREATE UNIQUE INDEX IF NOT EXISTS uq_route_plans_salesman_date ON route_plans (salesman_id, route_date);

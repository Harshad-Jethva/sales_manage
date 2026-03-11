<?php
require_once 'config/db.php';

try {
    // Add due_date to bills
    $conn->exec("ALTER TABLE bills ADD COLUMN IF NOT EXISTS due_date DATE");
    echo "Added due_date to bills successfully.\n";

    // Create collection_receipts table
    $sql = "CREATE TABLE IF NOT EXISTS collection_receipts (
        receipt_id SERIAL PRIMARY KEY,
        client_id INT REFERENCES clients(id) ON DELETE CASCADE,
        bill_id INT REFERENCES bills(id) ON DELETE CASCADE,
        collected_amount NUMERIC(12,2) NOT NULL,
        remaining_balance NUMERIC(12,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        receipt_pdf_path VARCHAR(255),
        whatsapp_status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $conn->exec($sql);
    echo "Created collection_receipts table successfully.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}

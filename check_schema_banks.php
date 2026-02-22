<?php
require_once 'backend/config/db.php';

try {
    $conn->exec("CREATE TABLE IF NOT EXISTS bank_accounts (
        id SERIAL PRIMARY KEY,
        bank_name VARCHAR(255) NOT NULL,
        account_number VARCHAR(50),
        account_holder VARCHAR(255),
        balance DECIMAL(15,2) DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    $conn->exec("CREATE TABLE IF NOT EXISTS bank_transactions (
        id SERIAL PRIMARY KEY,
        account_id INT NOT NULL,
        type VARCHAR(10) CHECK (type IN ('credit', 'debit')) NOT NULL,
        amount DECIMAL(15,2) NOT NULL,
        description TEXT,
        transaction_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES bank_accounts(id) ON DELETE CASCADE
    )");

    echo "Bank tables checked/created successfully.";
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>

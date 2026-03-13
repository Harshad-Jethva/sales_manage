<?php
require_once 'config/db.php';

try {
    // Create transports table
    $sql1 = "CREATE TABLE IF NOT EXISTS transports (
        id SERIAL PRIMARY KEY,
        transport_name VARCHAR(255) NOT NULL,
        driver_name VARCHAR(255),
        driver_mobile VARCHAR(20),
        vehicle_number VARCHAR(50),
        transport_type VARCHAR(50),
        dispatch_date DATE DEFAULT CURRENT_DATE,
        destination_city VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $conn->exec($sql1);
    echo "Table 'transports' created or already exists.\n";

    // Create transport_builty table
    $sql2 = "CREATE TABLE IF NOT EXISTS transport_builty (
        id SERIAL PRIMARY KEY,
        transport_id INT REFERENCES transports(id) ON DELETE CASCADE,
        client_id INT NOT NULL,
        order_id INT,
        builty_number VARCHAR(100) UNIQUE,
        builty_document_path VARCHAR(255),
        whatsapp_status VARCHAR(50) DEFAULT 'Pending',
        whatsapp_msg_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $conn->exec($sql2);
    echo "Table 'transport_builty' created or already exists.\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>

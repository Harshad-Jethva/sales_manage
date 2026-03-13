<?php
require_once 'config/db.php';

try {
    $sql = "
    CREATE TABLE IF NOT EXISTS delivery_persons (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        address TEXT,
        vehicle_details TEXT,
        warehouse_id INTEGER,
        status VARCHAR(20) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS delivery_orders (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        delivery_person_id INTEGER REFERENCES delivery_persons(id) ON DELETE SET NULL,
        delivery_status VARCHAR(50) DEFAULT 'Pending',
        assigned_date DATE,
        delivery_priority VARCHAR(20) DEFAULT 'Normal',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS delivery_tracking (
        id SERIAL PRIMARY KEY,
        delivery_person_id INTEGER NOT NULL REFERENCES delivery_persons(id) ON DELETE CASCADE,
        latitude NUMERIC(10, 8) NOT NULL,
        longitude NUMERIC(11, 8) NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS delivery_logs (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        delivery_person_id INTEGER REFERENCES delivery_persons(id) ON DELETE CASCADE,
        delivery_status VARCHAR(50) NOT NULL,
        delivery_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        remarks TEXT
    );
    ";

    $conn->exec($sql);
    echo "Tables created successfully.\n";
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>

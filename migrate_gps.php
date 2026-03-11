<?php
require 'backend/config/db.php';

$queries = [
    "CREATE TABLE IF NOT EXISTS salesman_locations (
        id SERIAL PRIMARY KEY,
        salesman_id INT,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        accuracy DECIMAL(8, 2),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    "CREATE TABLE IF NOT EXISTS routes (
        id SERIAL PRIMARY KEY,
        route_name VARCHAR(255) NOT NULL,
        route_date DATE NOT NULL,
        salesman_id INT,
        warehouse_id INT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    "CREATE TABLE IF NOT EXISTS route_clients (
        id SERIAL PRIMARY KEY,
        route_id INT REFERENCES routes(id) ON DELETE CASCADE,
        client_id INT,
        visit_sequence INT NOT NULL,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        visit_status VARCHAR(50) DEFAULT 'pending',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )",
    "CREATE TABLE IF NOT EXISTS visit_logs (
        id SERIAL PRIMARY KEY,
        salesman_id INT,
        client_id INT,
        route_id INT REFERENCES routes(id),
        checkin_latitude DECIMAL(10, 8),
        checkin_longitude DECIMAL(11, 8),
        checkin_time TIMESTAMP,
        checkout_time TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )"
];

foreach ($queries as $q) {
    try {
        $conn->exec($q);
        echo "Success: " . substr($q, 0, 40) . "...\n";
    } catch (PDOException $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
}
?>

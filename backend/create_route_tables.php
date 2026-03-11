<?php
require_once 'config/db.php';

try {
    // 1. Create route_plans table
    $sql1 = "CREATE TABLE IF NOT EXISTS route_plans (
        route_id SERIAL PRIMARY KEY,
        salesman_id INT NOT NULL,
        route_date DATE NOT NULL,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (salesman_id, route_date)
    )";
    $conn->exec($sql1);
    echo "route_plans created.\n";

    // 2. Create route_clients table
    $sql2 = "CREATE TABLE IF NOT EXISTS route_clients (
        id SERIAL PRIMARY KEY,
        route_id INT NOT NULL,
        client_id INT NOT NULL,
        area_name VARCHAR(150),
        outstanding_amount DECIMAL(15,2) DEFAULT 0.00,
        FOREIGN KEY (route_id) REFERENCES route_plans(route_id) ON DELETE CASCADE,
        UNIQUE (route_id, client_id)
    )";
    $conn->exec($sql2);
    echo "route_clients created.\n";

} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>

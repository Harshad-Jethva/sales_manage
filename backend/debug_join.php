<?php
require_once 'config/db.php';
try {
    $stmt = $conn->query("SELECT route_id, salesman_id FROM route_plans");
    foreach($stmt->fetchAll() as $row) {
        echo "Route {$row['route_id']} -> Salesman {$row['salesman_id']}\n";
    }
    
    $stmt = $conn->query("SELECT id, name FROM users");
    foreach($stmt->fetchAll() as $row) {
        echo "User {$row['id']} -> {$row['name']}\n";
    }
} catch (Exception $e) {
    echo $e->getMessage();
}
?>

<?php
require_once 'config/db.php';
try {
    $stmt = $conn->query("SELECT route_id, salesman_id, route_date FROM route_plans ORDER BY route_id DESC");
    $plans = $stmt->fetchAll();
    echo json_encode($plans, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo $e->getMessage();
}
?>

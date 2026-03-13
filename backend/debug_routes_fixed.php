<?php
require_once 'config/db.php';
try {
    echo "--- ROUTE PLANS ---\n";
    $stmt = $conn->query("SELECT route_id, salesman_id, route_date FROM route_plans");
    $plans = $stmt->fetchAll();
    foreach($plans as $p) {
        $checkUser = $conn->prepare("SELECT name FROM users WHERE id = ?");
        $checkUser->execute([$p['salesman_id']]);
        $user = $checkUser->fetch();
        if ($user) {
            echo "ID: {$p['route_id']}, Salesman ID: {$p['salesman_id']}, Name: {$user['name']}, Date: {$p['route_date']}\n";
        } else {
            echo "ID: {$p['route_id']}, Salesman ID: {$p['salesman_id']}, Name: MISSING USER, Date: {$p['route_date']}\n";
        }
    }
} catch (Exception $e) {
    echo $e->getMessage();
}
?>

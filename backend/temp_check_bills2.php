<?php
require_once 'config/db.php';
try {
    $stmt = $conn->query("SELECT id, bill_number, client_id, payment_method, total_amount, paid_amount, due_date FROM bills");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo $e->getMessage();
}

<?php
require_once 'e:/xampp/htdocs/sales_manage/backend/config/db.php';

try {
    $stmt = $conn->query("SELECT *, type as customer_type FROM clients ORDER BY created_at DESC");
    $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["success" => true, "data" => $clients]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>

<?php
require_once 'e:/xampp/htdocs/sales_manage/backend/config/db.php';

try {
    $stmt = $conn->query("SELECT COUNT(*) FROM clients");
    $count = $stmt->fetchColumn();
    echo "Clients count: " . $count . "\n";
    
    $stmt = $conn->query("SELECT * FROM clients LIMIT 5");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    print_r($rows);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>

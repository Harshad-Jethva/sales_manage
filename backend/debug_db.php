<?php
require_once 'config/db.php';
echo "Last 5 bills:\n";
$stmt = $conn->query("SELECT id, bill_number, customer_id, bill_type, status, created_at FROM bills ORDER BY id DESC LIMIT 5");
while($row = $stmt->fetch()) {
    print_r($row);
}
echo "\nLast 5 bill items:\n";
$stmt = $conn->query("SELECT id, bill_id, item_name, quantity, total FROM bill_items ORDER BY id DESC LIMIT 5");
while($row = $stmt->fetch()) {
    print_r($row);
}
?>

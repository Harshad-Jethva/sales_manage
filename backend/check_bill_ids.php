<?php
require_once 'config/db.php';
echo "Last 5 bills detailed:\n";
$stmt = $conn->query("SELECT id, bill_number, client_id, customer_id, bill_type FROM bills ORDER BY id DESC LIMIT 5");
while($row = $stmt->fetch()) {
    print_r($row);
}
?>

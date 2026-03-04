<?php
require_once 'config/db.php';
echo "Customers table count: ";
$stmt = $conn->query("SELECT COUNT(*) FROM customers");
echo $stmt->fetchColumn() . "\n";
echo "First 5 customers:\n";
$stmt = $conn->query("SELECT * FROM customers LIMIT 5");
while($row = $stmt->fetch()) {
    print_r($row);
}
?>

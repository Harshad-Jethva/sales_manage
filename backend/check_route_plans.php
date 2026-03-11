<?php
require 'config/db.php';
$stmt = $conn->query("SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'route_plans'");
foreach($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
    echo $row['column_name'] . " - " . $row['data_type'] . " - " . $row['column_default'] . "\n";
}
?>

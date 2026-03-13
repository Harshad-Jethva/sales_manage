<?php
require_once 'config/db.php';
try {
    $stmt = $conn->query("SELECT pg_get_serial_sequence('route_plans', 'route_id')");
    echo "Sequence: " . $stmt->fetchColumn() . "\n";
    
    $stmt = $conn->query("SELECT * FROM information_schema.columns WHERE table_name = 'route_plans'");
    foreach($stmt->fetchAll() as $row) {
        echo "Column: {$row['column_name']} Type: {$row['data_type']}\n";
    }
} catch (Exception $e) {
    echo $e->getMessage();
}
?>

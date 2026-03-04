<?php
require_once 'config/db.php';

function checkTableInfo($conn, $table) {
    echo "Info for table: $table\n";
    $stmt = $conn->prepare("SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = ?");
    $stmt->execute([$table]);
    while ($row = $stmt->fetch()) {
        print_r($row);
    }
    echo "\n";
}

checkTableInfo($conn, 'bills');
checkTableInfo($conn, 'bill_items');
?>

<?php
require_once 'config/db.php';

try {
    $stmt = $conn->query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'bills' AND column_name = 'due_date'");
    $bills = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Due date in bills:\n";
    print_r($bills);
} catch (Exception $e) {
    echo $e->getMessage();
}

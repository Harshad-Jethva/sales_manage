<?php
require_once 'config/db.php';
try {
    $stmt = $conn->query("SELECT * FROM bills WHERE client_id = 2");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo $e->getMessage();
}

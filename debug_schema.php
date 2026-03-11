<?php
require 'backend/config/db.php';
try {
    $stmt = $conn->query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products'");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch(Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

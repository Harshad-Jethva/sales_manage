<?php
require_once 'backend/config/db.php';

try {
    $sql = file_get_contents('database/notifications_schema.sql');
    $conn->exec($sql);
    echo json_encode(["success" => true, "message" => "Database schema updated successfully"]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>

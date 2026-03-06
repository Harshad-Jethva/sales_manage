<?php
require_once 'backend/config/db.php';
try {
    $stmt = $conn->query("SELECT DISTINCT role FROM users");
    $roles = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo json_encode($roles);
} catch (Exception $e) {
    echo $e->getMessage();
}
?>

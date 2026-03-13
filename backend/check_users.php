<?php
require_once 'config/db.php';
try {
    $stmt = $conn->query("SELECT id, name, role FROM users");
    $users = $stmt->fetchAll();
    echo json_encode($users, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo $e->getMessage();
}
?>

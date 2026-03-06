<?php
require_once 'backend/config/db.php';
try {
    $stmt = $conn->query("SELECT id, name, username, role, session_token FROM users");
    $users = $stmt->fetchAll();
    echo json_encode($users);
} catch (Exception $e) {
    echo $e->getMessage();
}
?>

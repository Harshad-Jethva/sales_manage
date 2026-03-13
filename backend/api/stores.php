<?php
require_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Fetch actual stores from external_stores table
        $stmt = $conn->query("SELECT id, store_name as name FROM external_stores ORDER BY store_name ASC");
        echo json_encode(["success" => true, "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        break;
    default:
        echo json_encode(["success" => false, "error" => "Method not supported"]);
}
?>

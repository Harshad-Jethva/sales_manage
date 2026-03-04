<?php
require_once '../config/db.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $role = isset($_GET['role']) ? $_GET['role'] : null;
    
    try {
        if ($role) {
            $stmt = $conn->prepare("SELECT id, name, username, role FROM users WHERE role = ?");
            $stmt->execute([$role]);
        } else {
            $stmt = $conn->prepare("SELECT id, name, username, role FROM users");
            $stmt->execute();
        }
        
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["success" => true, "data" => $users]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
}
?>

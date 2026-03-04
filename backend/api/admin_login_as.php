<?php
require_once '../config/db.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));

    if (!empty($data->admin_token) && !empty($data->target_user_id)) {
        try {
            // Verify admin token
            $adminStmt = $conn->prepare("SELECT id, role FROM users WHERE session_token = ? LIMIT 1");
            $adminStmt->execute([$data->admin_token]);
            $admin = $adminStmt->fetch(PDO::FETCH_ASSOC);

            if ($admin && $admin['role'] === 'admin') {
                // Fetch target user
                $targetStmt = $conn->prepare("SELECT id, name, username, role FROM users WHERE id = ? LIMIT 1");
                $targetStmt->execute([$data->target_user_id]);
                $targetUser = $targetStmt->fetch(PDO::FETCH_ASSOC);

                if ($targetUser) {
                    $token = bin2hex(random_bytes(16));
                    
                    // Save token for target user
                    $updateToken = $conn->prepare("UPDATE users SET session_token = ? WHERE id = ?");
                    $updateToken->execute([$token, $targetUser['id']]);
                    
                    echo json_encode([
                        "success" => true,
                        "message" => "Login as " . $targetUser['username'] . " successful",
                        "user" => $targetUser,
                        "token" => $token
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode(["success" => false, "message" => "Target user not found"]);
                }
            } else {
                http_response_code(403);
                echo json_encode(["success" => false, "message" => "Unauthorized: Admin access required"]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Incomplete data"]);
    }
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
}
?>

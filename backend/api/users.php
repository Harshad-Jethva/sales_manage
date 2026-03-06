<?php
require_once '../config/db.php';

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGet($conn);
        break;
    case 'POST':
        handlePost($conn);
        break;
    case 'PUT':
        handlePut($conn);
        break;
    case 'DELETE':
        handleDelete($conn);
        break;
    default:
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Method not allowed"]);
        break;
}

function handleGet($conn) {
    $role = isset($_GET['role']) ? $_GET['role'] : null;
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    
    try {
        if ($id) {
            $stmt = $conn->prepare("SELECT id, name, username, role, mobile_number, email, account_status, created_at, updated_at FROM users WHERE id = ?");
            $stmt->execute([$id]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $user]);
        } else if ($role) {
            $stmt = $conn->prepare("SELECT id, name, username, role, mobile_number, email, account_status, created_at, updated_at FROM users WHERE role = ? ORDER BY created_at DESC");
            $stmt->execute([$role]);
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $users]);
        } else {
            $stmt = $conn->prepare("SELECT id, name, username, role, mobile_number, email, account_status, created_at, updated_at FROM users ORDER BY created_at DESC");
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $users]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
}

function handlePost($conn) {
    $data = json_decode(file_get_contents("php://input"));
    
    if (empty($data->name) || empty($data->username) || empty($data->password) || empty($data->role)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        return;
    }
    
    try {
        // Check if username exists
        $check = $conn->prepare("SELECT id FROM users WHERE username = ?");
        $check->execute([$data->username]);
        if ($check->fetch()) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Username already exists"]);
            return;
        }
        
        $hashedPassword = password_hash($data->password, PASSWORD_DEFAULT);
        $status = isset($data->account_status) ? $data->account_status : 'active';
        
        $stmt = $conn->prepare("INSERT INTO users (name, username, password, role, mobile_number, email, account_status) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $data->name,
            $data->username,
            $hashedPassword,
            $data->role,
            $data->mobile_number ?? null,
            $data->email ?? null,
            $status
        ]);
        
        echo json_encode(["success" => true, "message" => "User created successfully"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
}

function handlePut($conn) {
    $data = json_decode(file_get_contents("php://input"));
    
    if (empty($data->id)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing user ID"]);
        return;
    }
    
    try {
        $fields = [];
        $params = [];
        
        if (isset($data->name)) { $fields[] = "name = ?"; $params[] = $data->name; }
        if (isset($data->role)) { $fields[] = "role = ?"; $params[] = $data->role; }
        if (isset($data->mobile_number)) { $fields[] = "mobile_number = ?"; $params[] = $data->mobile_number; }
        if (isset($data->email)) { $fields[] = "email = ?"; $params[] = $data->email; }
        if (isset($data->account_status)) { $fields[] = "account_status = ?"; $params[] = $data->account_status; }
        
        if (isset($data->password) && !empty($data->password)) {
            $fields[] = "password = ?";
            $params[] = password_hash($data->password, PASSWORD_DEFAULT);
        }
        
        $fields[] = "updated_at = CURRENT_TIMESTAMP";
        
        if (empty($fields)) {
            echo json_encode(["success" => true, "message" => "No changes made"]);
            return;
        }
        
        $params[] = $data->id;
        $sql = "UPDATE users SET " . implode(", ", $fields) . " WHERE id = ?";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        
        echo json_encode(["success" => true, "message" => "User updated successfully"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
}

function handleDelete($conn) {
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    
    if (!$id) {
        $data = json_decode(file_get_contents("php://input"));
        $id = $data->id ?? null;
    }
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Missing user ID"]);
        return;
    }
    
    try {
        $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["success" => true, "message" => "User deleted successfully"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
}
?>

<?php
require_once '../config/db.php';

// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// Helper function to get the current user from token
function getCurrentUser($conn) {
    $token = null;
    
    // Check Authorization header in $_SERVER
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $token = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $token = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } elseif (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        if (isset($headers['Authorization'])) {
            $token = $headers['Authorization'];
        }
    }

    if ($token && preg_match('/Bearer\s(\S+)/', $token, $matches)) {
        $token = $matches[1];
        $stmt = $conn->prepare("SELECT id, name, username, role FROM users WHERE session_token = ? LIMIT 1");
        $stmt->execute([$token]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($user) return $user;
        
        // Log if token provided but no user found
        error_log("Notification System: Token provided but no user match in DB for token: " . substr($token, 0, 8) . "...");
    }
    return null;
}

$currentUser = getCurrentUser($conn);

switch ($method) {
    case 'GET':
        handleGet($conn, $currentUser);
        break;
    case 'POST':
        handlePost($conn, $currentUser);
        break;
    case 'PUT':
        handlePut($conn, $currentUser); // For complete updates if needed
        break;
    case 'PATCH':
        handlePatch($conn, $currentUser); // For partial updates like status or is_read
        break;
    case 'DELETE':
        handleDelete($conn, $currentUser);
        break;
    default:
        http_response_code(405);
        echo json_encode(["success" => false, "message" => "Method not allowed"]);
        break;
}

function handleGet($conn, $currentUser) {
    if (!$currentUser) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Unauthorized"]);
        return;
    }

    $action = $_GET['action'] ?? 'list';

    if ($action === 'list') {
        // List notifications for the current user
        try {
            $stmt = $conn->prepare("
                SELECT n.*, nr.status, nr.is_read, nr.read_at, nr.response_at, u.name as sender_name 
                FROM notifications n
                JOIN notification_recipients nr ON n.id = nr.notification_id
                LEFT JOIN users u ON n.sender_id = u.id
                WHERE nr.user_id = ?
                ORDER BY n.created_at DESC
            ");
            $stmt->execute([$currentUser['id']]);
            $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $notifications]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    } elseif ($action === 'admin_list') {
        // List all notifications sent by admin (or all notifications if super admin)
        if ($currentUser['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(["success" => false, "message" => "Forbidden"]);
            return;
        }
        try {
            $stmt = $conn->prepare("
                SELECT n.*, u.name as sender_name,
                       (SELECT COUNT(*) FROM notification_recipients WHERE notification_id = n.id) as total_recipients,
                       (SELECT COUNT(*) FROM notification_recipients WHERE notification_id = n.id AND is_read = TRUE) as read_count,
                       (SELECT COUNT(*) FROM notification_recipients WHERE notification_id = n.id AND status = 'accepted') as accepted_count,
                       (SELECT COUNT(*) FROM notification_recipients WHERE notification_id = n.id AND status = 'rejected') as rejected_count
                FROM notifications n
                LEFT JOIN users u ON n.sender_id = u.id
                ORDER BY n.created_at DESC
            ");
            $stmt->execute();
            $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $notifications]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    } elseif ($action === 'recipient_history') {
        // Specific for tracking responses
        if ($currentUser['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(["success" => false, "message" => "Forbidden"]);
            return;
        }
        try {
            $sql = "
                SELECT nr.*, n.title, u.name as recipient_name, u.role as recipient_role
                FROM notification_recipients nr
                JOIN notifications n ON nr.notification_id = n.id
                JOIN users u ON nr.user_id = u.id
                WHERE 1=1
            ";
            $params = [];
            
            if (!empty($_GET['notification_id'])) {
                $sql .= " AND nr.notification_id = ?";
                $params[] = $_GET['notification_id'];
            }
            if (!empty($_GET['status'])) {
                $sql .= " AND nr.status = ?";
                $params[] = $_GET['status'];
            }
            if (!empty($_GET['role'])) {
                $sql .= " AND u.role = ?";
                $params[] = $_GET['role'];
            }

            $sql .= " ORDER BY nr.created_at DESC";
            
            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
            $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $history]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    } elseif ($action === 'detail') {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "ID required"]);
            return;
        }
        try {
            $stmt = $conn->prepare("
                SELECT n.*, nr.status, nr.is_read, nr.read_at, nr.response_at, u.name as sender_name 
                FROM notifications n
                JOIN notification_recipients nr ON n.id = nr.notification_id
                LEFT JOIN users u ON n.sender_id = u.id
                WHERE n.id = ? AND nr.user_id = ?
            ");
            $stmt->execute([$id, $currentUser['id']]);
            $notification = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($notification) {
                // Auto mark as read if not already read
                if (!$notification['is_read']) {
                    $update = $conn->prepare("UPDATE notification_recipients SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE notification_id = ? AND user_id = ?");
                    $update->execute([$id, $currentUser['id']]);
                    $notification['is_read'] = true;
                    $notification['read_at'] = date('Y-m-d H:i:s');
                }
                echo json_encode(["success" => true, "data" => $notification]);
            } else {
                http_response_code(404);
                echo json_encode(["success" => false, "message" => "Notification not found"]);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
    }
}

function handlePost($conn, $currentUser) {
    if (!$currentUser) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Authentication required. Please log in again."]);
        return;
    }

    $role = trim(strtolower($currentUser['role'] ?? ''));
    if ($role !== 'admin') {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Only administrators can send notifications. Your current role is: " . $role]);
        return;
    }

    // Handle multipart/form-data for uploads
    $title = $_POST['title'] ?? '';
    $message = $_POST['message'] ?? '';
    $targetType = $_POST['target_type'] ?? 'all'; // all, role, multiple_roles, specific_user
    $targetValues = $_POST['target_values'] ?? ''; // role names or user_id

    if (empty($title) || empty($message)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Title and Message are strictly required"]);
        return;
    }

    $attachmentPath = null;
    if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] === UPLOAD_ERR_OK) {
        // Use absolute path for reliability
        $root = dirname(__DIR__, 2); // E:\xampp\htdocs\sales_manage
        $uploadDir = $root . DIRECTORY_SEPARATOR . 'backend' . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'notifications' . DIRECTORY_SEPARATOR;
        
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        $fileName = time() . '_' . preg_replace('/[^A-Za-z0-9._-]/', '_', basename($_FILES['attachment']['name']));
        $targetFilePath = $uploadDir . $fileName;
        
        if (move_uploaded_file($_FILES['attachment']['tmp_name'], $targetFilePath)) {
            $attachmentPath = 'backend/uploads/notifications/' . $fileName;
        } else {
             // Continue without attachment if upload fails, but log it
             error_log("Failed to move uploaded file to " . $targetFilePath);
        }
    }

    try {
        $conn->beginTransaction();

        // 1. Insert notification
        $stmt = $conn->prepare("INSERT INTO notifications (title, message, attachment_path, sender_id) VALUES (?, ?, ?, ?) RETURNING id");
        $stmt->execute([$title, $message, $attachmentPath, $currentUser['id']]);
        $notificationId = $stmt->fetchColumn();

        if (!$notificationId) {
             throw new Exception("Failed to generate notification ID");
        }

        // 2. Resolve recipients
        $recipientIds = [];
        if ($targetType === 'all') {
            $stmt = $conn->prepare("SELECT id FROM users");
            $stmt->execute();
            $recipientIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
        } elseif ($targetType === 'role') {
            $stmt = $conn->prepare("SELECT id FROM users WHERE role = ?");
            $stmt->execute([$targetValues]);
            $recipientIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
        } elseif ($targetType === 'multiple_roles') {
            $roles = array_filter(explode(',', $targetValues));
            if (!empty($roles)) {
                $placeholders = implode(',', array_fill(0, count($roles), '?'));
                $stmt = $conn->prepare("SELECT id FROM users WHERE role IN ($placeholders)");
                $stmt->execute($roles);
                $recipientIds = $stmt->fetchAll(PDO::FETCH_COLUMN);
            }
        } elseif ($targetType === 'specific_user') {
            // Validate user exists
            $stmt = $conn->prepare("SELECT id FROM users WHERE id = ?");
            $stmt->execute([$targetValues]);
            if ($stmt->fetch()) {
                $recipientIds = [$targetValues];
            }
        }

        // 3. Insert recipients
        if (!empty($recipientIds)) {
            $insertRecipSql = "INSERT INTO notification_recipients (notification_id, user_id) VALUES (?, ?)";
            $insStmt = $conn->prepare($insertRecipSql);
            foreach ($recipientIds as $userId) {
                // Avoid self-notification if preferred, but usually admins want confirmation
                $insStmt->execute([$notificationId, $userId]);
            }
        } else {
             throw new Exception("No valid recipients found for target: $targetType ($targetValues)");
        }

        $conn->commit();
        echo json_encode([
            "success" => true, 
            "message" => "Notification broadcasted to " . count($recipientIds) . " users", 
            "notification_id" => $notificationId
        ]);
    } catch (Exception $e) {
        if ($conn->inTransaction()) {
            $conn->rollBack();
        }
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Server logic error: " . $e->getMessage()]);
    }
}

function handlePatch($conn, $currentUser) {
    if (!$currentUser) {
        http_response_code(401);
        return;
    }

    $data = json_decode(file_get_contents("php://input"));
    $id = $data->notification_id ?? null;
    $action = $data->action ?? ''; // mark_read, respond

    if (!$id) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Notification ID required"]);
        return;
    }

    try {
        if ($action === 'mark_read') {
            $stmt = $conn->prepare("UPDATE notification_recipients SET is_read = TRUE, read_at = CURRENT_TIMESTAMP WHERE notification_id = ? AND user_id = ?");
            $stmt->execute([$id, $currentUser['id']]);
            echo json_encode(["success" => true, "message" => "Marked as read"]);
        } elseif ($action === 'respond') {
            $status = $data->status ?? 'pending'; // accepted, rejected
            if (!in_array($status, ['accepted', 'rejected'])) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Invalid status"]);
                return;
            }
            $stmt = $conn->prepare("UPDATE notification_recipients SET status = ?, response_at = CURRENT_TIMESTAMP, is_read = TRUE, read_at = COALESCE(read_at, CURRENT_TIMESTAMP) WHERE notification_id = ? AND user_id = ?");
            $stmt->execute([$status, $id, $currentUser['id']]);
            echo json_encode(["success" => true, "message" => "Response recorded as " . $status]);
        } else {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Invalid action"]);
        }
    } catch (PDOException $e) {
        error_log($e->getMessage(), 3, __DIR__ . "/error.log");
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
}

function handlePut($conn, $currentUser) {
    // Implement if needed for editing notifications (usually not allowed once sent)
    http_response_code(501);
    echo json_encode(["success" => false, "message" => "Not implemented"]);
}

function handleDelete($conn, $currentUser) {
    if (!$currentUser || $currentUser['role'] !== 'admin') {
        http_response_code(403);
        return;
    }

    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        return;
    }

    try {
        $stmt = $conn->prepare("DELETE FROM notifications WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["success" => true, "message" => "Notification deleted"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
}
?>

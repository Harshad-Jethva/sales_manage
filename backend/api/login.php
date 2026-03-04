<?php
require_once '../config/db.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$debug_log = [];

function logDebug($msg) {
    global $debug_log;
    $debug_log[] = $msg;
    // Also write to file for persistence
    file_put_contents('login_debug.log', date('[Y-m-d H:i:s] ') . $msg . "\n", FILE_APPEND);
}

// Self-healing: Create users table if not exists and ensure default users
function healUsers($conn) {
    global $debug_log;
    try {
        logDebug("Healing users table...");
        $sql = "CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(20) CHECK (role IN ('admin', 'cashier', 'manager', 'accountant', 'salesman', 'warehouse')) DEFAULT 'cashier',
            session_token VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";
        $conn->exec($sql);

        // Ensure role constraint is updated (PostgreSQL specific adjustment)
        try {
            // First drop existing constraint if it exists (name might vary, but we can try to drop and recreate)
            // For simplicity in a 'heal' function, we try to alter the column type/check
            $conn->exec("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
            $conn->exec("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'cashier', 'manager', 'accountant', 'salesman', 'warehouse'))");
        } catch (Exception $e) { logDebug("Role constraint update note: " . $e->getMessage()); }

        // Ensure session_token column exists if table was created previously
        try {
            $conn->exec("ALTER TABLE users ADD COLUMN session_token VARCHAR(255)");
        } catch (Exception $e) { /* silent fail, column likely exists */ }

        // Define users to ensure
        $users = [
            'admin' => [
                'name' => 'System Admin',
                'pass' => 'admin123',
                'role' => 'admin'
            ],
            'cashier' => [
                'name' => 'Counter Staff',
                'pass' => 'cashier123',
                'role' => 'cashier'
            ],
            'accountant' => [
                'name' => 'Account Manager',
                'pass' => 'accountant123',
                'role' => 'accountant'
            ],
            'dev' => [
                'name' => 'Developer',
                'pass' => 'dev123',
                'role' => 'admin'
            ],
            'salesman' => [
                'name' => 'Default Salesman',
                'pass' => 'salesman123',
                'role' => 'salesman'
            ],
            'warehouse' => [
                'name' => 'Warehouse Manager',
                'pass' => 'warehouse123',
                'role' => 'warehouse'
            ]
        ];

        foreach ($users as $username => $details) {
            // Check if user exists
            $stmt = $conn->prepare("SELECT id, password FROM users WHERE username = ?");
            $stmt->execute([$username]);
            $existingUser = $stmt->fetch(PDO::FETCH_ASSOC);

            $newHash = password_hash($details['pass'], PASSWORD_DEFAULT);

            if ($existingUser) {
                logDebug("User $username exists. Updating password...");
                // Update existing user to reset password (ensure demo access works)
                $update = $conn->prepare("UPDATE users SET password = ?, role = ? WHERE username = ?");
                $result = $update->execute([$newHash, $details['role'], $username]);
                logDebug("Update result for $username: " . ($result ? 'Success' : 'Failed'));
            } else {
                logDebug("User $username does not exist. Creating...");
                // Create new user
                $insert = $conn->prepare("INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)");
                $result = $insert->execute([$details['name'], $username, $newHash, $details['role']]);
                logDebug("Insert result for $username: " . ($result ? 'Success' : 'Failed'));
            }
        }

    } catch (PDOException $e) {
        logDebug("Heal Users Error: " . $e->getMessage());
    }
}

try {
    healUsers($conn);
} catch (Exception $e) {
    logDebug("General Error during heal: " . $e->getMessage());
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $rawInput = file_get_contents("php://input");
    logDebug("Raw Input: " . $rawInput);
    $data = json_decode($rawInput);

    if (!empty($data->username) && !empty($data->password)) {
        try {
            logDebug("Attempting login for: " . $data->username);
            $stmt = $conn->prepare("SELECT * FROM users WHERE username = ? LIMIT 1");
            $stmt->execute([$data->username]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($user) {
                logDebug("User found. ID: " . $user['id'] . ", Role: " . $user['role']);
                // Verify password
                if (password_verify($data->password, $user['password'])) {
                    logDebug("Password verified successfully.");
                    // Success
                    unset($user['password']); // Don't send password back
                    
                    $token = bin2hex(random_bytes(16));
                    
                    // Save token to db
                    $updateToken = $conn->prepare("UPDATE users SET session_token = ? WHERE id = ?");
                    $updateToken->execute([$token, $user['id']]);
                    
                    echo json_encode([
                        "success" => true,
                        "message" => "Login successful",
                        "user" => $user,
                        "token" => $token,
                        "debug" => $debug_log
                    ]);
                } else {
                    logDebug("Password verification failed.");
                    http_response_code(401);
                    echo json_encode(["success" => false, "message" => "Invalid username or password (Password Mismatch)", "debug" => $debug_log]);
                }
            } else {
                logDebug("User not found in database.");
                http_response_code(401);
                echo json_encode(["success" => false, "message" => "Invalid username or password (User Not Found)", "debug" => $debug_log]);
            }
        } catch (PDOException $e) {
            logDebug("Database error during login: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage(), "debug" => $debug_log]);
        }
    } else {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Incomplete data", "debug" => $debug_log]);
    }
} else {
    http_response_code(405); // Method Not Allowed
    echo json_encode(["success" => false, "message" => "Method not allowed", "debug" => $debug_log]);
}
?>

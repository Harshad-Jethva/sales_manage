<?php
require_once '../config/db.php';

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Helper to get authenticated user
function getAuthenticatedUser($conn) {
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $token = $matches[1];
            $stmt = $conn->prepare("SELECT id, name, username, role FROM users WHERE session_token = ? LIMIT 1");
            $stmt->execute([$token]);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }
    }
    return null;
}

$user = getAuthenticatedUser($conn);
if (!$user) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $rawInput = file_get_contents("php://input");
    $data = json_decode($rawInput, true);
    
    if (!$data) {
        echo json_encode(["success" => false, "message" => "Invalid input data"]);
        exit;
    }

    try {
        $stmt = $conn->prepare("INSERT INTO cash_handovers 
            (user_id, counter_name, handover_date, total_cash, opening_balance, petty_cash, expected_balance, difference, denomination_data, payment_data, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $stmt->execute([
            $user['id'],
            $data['counter_name'],
            $data['handover_date'] ?? date('Y-m-d'),
            $data['total_cash'] ?? 0,
            $data['opening_balance'] ?? 0,
            $data['petty_cash'] ?? 0,
            $data['expected_balance'] ?? 0,
            $data['difference'] ?? 0,
            json_encode($data['denomination_data'] ?? []),
            json_encode($data['payment_data'] ?? []),
            $data['notes'] ?? ''
        ]);

        echo json_encode(["success" => true, "message" => "Cash handover recorded successfully"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
} elseif ($method === 'GET') {
    $action = $_GET['action'] ?? 'history';

    if ($action === 'get_expected') {
        $date = $_GET['date'] ?? date('Y-m-d');
        // Simple calculation: sum of paid_amount for 'Cash' bills on that date
        try {
            $stmt = $conn->prepare("SELECT SUM(paid_amount) as expected_cash FROM bills 
                                   WHERE bill_date = ? AND payment_method ILIKE '%cash%'");
            $stmt->execute([$date]);
            $result = $stmt->fetch();
            echo json_encode(["success" => true, "expected_cash" => floatval($result['expected_cash'] ?? 0)]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
        }
        exit;
    }

    // Default: Get History
    try {
        $query = "SELECT ch.*, u.name as user_display_name FROM cash_handovers ch JOIN users u ON ch.user_id = u.id WHERE 1=1";
        $params = [];
        
        if (!empty($_GET['date_from'])) {
            $query .= " AND ch.handover_date >= ?";
            $params[] = $_GET['date_from'];
        }
        if (!empty($_GET['date_to'])) {
            $query .= " AND ch.handover_date <= ?";
            $params[] = $_GET['date_to'];
        }
        if (!empty($_GET['counter'])) {
            $query .= " AND ch.counter_name = ?";
            $params[] = $_GET['counter'];
        }
        if (!empty($_GET['user_id'])) {
            $query .= " AND ch.user_id = ?";
            $params[] = $_GET['user_id'];
        }
        
        $query .= " ORDER BY ch.created_at DESC";
        $stmt = $conn->prepare($query);
        $stmt->execute($params);
        $results = $stmt->fetchAll();
        
        // Decode JSON data for frontend convenience
        foreach ($results as &$row) {
            $row['denomination_data'] = json_decode($row['denomination_data'], true);
            $row['payment_data'] = json_decode($row['payment_data'], true);
        }
        
        echo json_encode(["success" => true, "data" => $results]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
}
?>

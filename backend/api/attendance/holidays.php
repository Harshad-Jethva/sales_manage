<?php
require_once '../../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $conn->prepare("SELECT * FROM holidays ORDER BY holiday_date ASC");
        $stmt->execute();
        $holidays = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'data' => $holidays]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['holiday_name']) || !isset($data['holiday_date'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
        exit;
    }

    try {
        if (isset($data['id'])) {
            $stmt = $conn->prepare("UPDATE holidays SET holiday_name=?, holiday_date=?, holiday_type=? WHERE id=?");
            $stmt->execute([$data['holiday_name'], $data['holiday_date'], $data['holiday_type'] ?? 'Public', $data['id']]);
        } else {
            $stmt = $conn->prepare("INSERT INTO holidays (holiday_name, holiday_date, holiday_type) VALUES (?, ?, ?)");
            $stmt->execute([$data['holiday_name'], $data['holiday_date'], $data['holiday_type'] ?? 'Public']);
        }
        echo json_encode(['success' => true, 'message' => 'Holiday saved successfully.']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Holiday ID required.']);
        exit;
    }
    
    try {
        $stmt = $conn->prepare("DELETE FROM holidays WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Holiday deleted.']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>

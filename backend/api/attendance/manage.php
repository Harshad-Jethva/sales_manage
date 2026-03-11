<?php
require_once '../../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $date = $_GET['date'] ?? null;
    $start_date = $_GET['start_date'] ?? null;
    $end_date = $_GET['end_date'] ?? null;
    $employee_id = $_GET['employee_id'] ?? null;

    try {
        if ($date) {
            $stmt = $conn->prepare("SELECT a.id, a.employee_id, a.attendance_date, a.status, u.name, u.role, u.department FROM attendance a JOIN users u ON a.employee_id = u.id WHERE a.attendance_date = ?");
            $stmt->execute([$date]);
            $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $records]);
        } elseif ($start_date && $end_date) {
            $sql = "SELECT a.id, a.employee_id, a.attendance_date, a.status, u.name, u.role, u.department FROM attendance a JOIN users u ON a.employee_id = u.id WHERE a.attendance_date BETWEEN ? AND ?";
            $params = [$start_date, $end_date];

            if ($employee_id) {
                $sql .= " AND a.employee_id = ?";
                $params[] = $employee_id;
            }
            $sql .= " ORDER BY a.attendance_date ASC, u.name ASC";

            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
            $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $records]);
        } else {
            $stmt = $conn->prepare("SELECT a.id, a.employee_id, a.attendance_date, a.status, u.name, u.role, u.department FROM attendance a JOIN users u ON a.employee_id = u.id ORDER BY a.attendance_date DESC LIMIT 500");
            $stmt->execute();
            $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $records]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['date']) || !isset($data['records'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Date and records are required.']);
        exit;
    }

    $date = $data['date'];
    $records = $data['records'];

    try {
        $conn->beginTransaction();
        
        $insertStmt = $conn->prepare("INSERT INTO attendance (employee_id, attendance_date, status) VALUES (?, ?, ?) ON CONFLICT (employee_id, attendance_date) DO UPDATE SET status = EXCLUDED.status");

        foreach ($records as $record) {
            if (isset($record['employee_id']) && isset($record['status'])) {
                $insertStmt->execute([$record['employee_id'], $date, $record['status']]);
            }
        }

        $conn->commit();
        echo json_encode(['success' => true, 'message' => 'Attendance saved successfully']);
    } catch (PDOException $e) {
        $conn->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>

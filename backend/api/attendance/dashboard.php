<?php
require_once '../../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $today = date('Y-m-d');
        $startOfMonth = date('Y-m-01');
        $endOfMonth = date('Y-m-t');

        $stmt = $conn->query("SELECT COUNT(*) FROM users");
        $total_employees = $stmt->fetchColumn();

        $stmt = $conn->prepare("SELECT COUNT(*) FROM attendance WHERE attendance_date = ? AND status = 'present'");
        $stmt->execute([$today]);
        $present_today = $stmt->fetchColumn();

        $stmt = $conn->prepare("SELECT COUNT(*) FROM attendance WHERE attendance_date = ? AND status = 'absent'");
        $stmt->execute([$today]);
        $absent_today = $stmt->fetchColumn();

        $stmt = $conn->prepare("SELECT * FROM holidays WHERE holiday_date >= ? ORDER BY holiday_date ASC LIMIT 5");
        $stmt->execute([$today]);
        $upcoming_holidays = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $stmt = $conn->prepare("SELECT status, COUNT(*) as count FROM attendance WHERE attendance_date BETWEEN ? AND ? GROUP BY status");
        $stmt->execute([$startOfMonth, $endOfMonth]);
        $monthly_stats = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);

        $total_p = $monthly_stats['present'] ?? 0;
        $total_a = $monthly_stats['absent'] ?? 0;
        
        $attendance_percentage = 0;
        if (($total_p + $total_a) > 0) {
            $attendance_percentage = round(($total_p / ($total_p + $total_a)) * 100, 2);
        }

        echo json_encode(['success' => true, 'data' => [
            'total_employees' => $total_employees,
            'present_today' => $present_today,
            'absent_today' => $absent_today,
            'upcoming_holidays' => $upcoming_holidays,
            'attendance_percentage' => $attendance_percentage
        ]]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>

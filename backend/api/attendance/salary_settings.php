<?php
require_once '../../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $conn->prepare("
            SELECT u.id as employee_id, u.name, u.role, u.department, 
                   COALESCE(s.monthly_salary, 0) as monthly_salary,
                   COALESCE(s.working_days, 26) as working_days,
                   ROUND(COALESCE(s.monthly_salary, 0) / NULLIF(COALESCE(s.working_days, 26), 0), 2) as per_day_salary,
                   COALESCE(s.holiday_policy, 'paid') as holiday_policy
            FROM users u
            LEFT JOIN salary_settings s ON u.id = s.employee_id
            ORDER BY u.name ASC
        ");
        $stmt->execute();
        $settings = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'data' => $settings]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!isset($data['employee_id']) || !isset($data['monthly_salary'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Missing required fields.']);
        exit;
    }

    $employee_id = $data['employee_id'];
    $monthly_salary = $data['monthly_salary'];
    $working_days = $data['working_days'] ?? 26;
    $holiday_policy = $data['holiday_policy'] ?? 'paid';

    try {
        $stmt = $conn->prepare("
            INSERT INTO salary_settings (employee_id, monthly_salary, working_days, holiday_policy, updated_at) 
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT (employee_id) DO UPDATE 
            SET monthly_salary = EXCLUDED.monthly_salary,
                working_days = EXCLUDED.working_days,
                holiday_policy = EXCLUDED.holiday_policy,
                updated_at = EXCLUDED.updated_at
        ");
        $stmt->execute([$employee_id, $monthly_salary, $working_days, $holiday_policy]);
        echo json_encode(['success' => true, 'message' => 'Salary setting saved successfully.']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>

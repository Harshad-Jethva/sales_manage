<?php
require_once '../../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $start_date = $_GET['start_date'] ?? null;
    $end_date = $_GET['end_date'] ?? null;
    $employee_id = $_GET['employee_id'] ?? null;

    if (!$start_date || !$end_date) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'start_date and end_date required.']);
        exit;
    }

    try {
        $settingsQuery = "SELECT u.id, u.name, u.role, u.department, 
                                 COALESCE(s.monthly_salary, 0) as monthly_salary,
                                 COALESCE(s.working_days, 26) as working_days,
                                 ROUND(COALESCE(s.monthly_salary, 0) / NULLIF(COALESCE(s.working_days, 26), 0), 2) as per_day_salary,
                                 COALESCE(s.holiday_policy, 'paid') as holiday_policy
                          FROM users u
                          LEFT JOIN salary_settings s ON u.id = s.employee_id";
        
        $params = [];
        if ($employee_id) {
            $settingsQuery .= " WHERE u.id = ?";
            $params[] = $employee_id;
        }
        $settingsQuery .= " ORDER BY u.name";
        
        $stmt = $conn->prepare($settingsQuery);
        $stmt->execute($params);
        $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $results = [];
        foreach ($employees as $emp) {
            $empId = $emp['id'];
            
            $stmtAtt = $conn->prepare("SELECT attendance_date, status FROM attendance WHERE employee_id = ? AND attendance_date BETWEEN ? AND ?");
            $stmtAtt->execute([$empId, $start_date, $end_date]);
            $attendance = $stmtAtt->fetchAll(PDO::FETCH_ASSOC);

            $stmtHol = $conn->prepare("SELECT holiday_date FROM holidays WHERE holiday_date BETWEEN ? AND ?");
            $stmtHol->execute([$start_date, $end_date]);
            $holidays = $stmtHol->fetchAll(PDO::FETCH_COLUMN);

            $presentDates = [];
            $absentDates = [];
            $holidayDates = $holidays;

            $total_present = 0;
            $total_absent = 0;

            foreach ($attendance as $record) {
                if ($record['status'] === 'present') {
                    $presentDates[] = $record['attendance_date'];
                    $total_present++;
                } elseif ($record['status'] === 'absent') {
                    $absentDates[] = $record['attendance_date'];
                    $total_absent++;
                } elseif ($record['status'] === 'holiday') {
                    if (!in_array($record['attendance_date'], $holidayDates)) {
                        $holidayDates[] = $record['attendance_date'];
                    }
                }
            }

            $total_holiday = count(array_unique($holidayDates));
            
            $paid_days = $total_present;
            if ($emp['holiday_policy'] === 'paid') {
                $paid_days += $total_holiday;
            }

            $per_day = $emp['per_day_salary'] ?? 0;
            $payable = $paid_days * $per_day;

            $results[] = [
                'employee_id' => $empId,
                'name' => $emp['name'],
                'role' => $emp['role'],
                'department' => $emp['department'],
                'monthly_salary' => $emp['monthly_salary'],
                'per_day_salary' => $emp['per_day_salary'],
                'holiday_policy' => $emp['holiday_policy'],
                'present_days' => $total_present,
                'absent_days' => $total_absent,
                'holiday_days' => $total_holiday,
                'payable_salary' => round($payable, 2),
                'present_dates' => $presentDates,
                'absent_dates' => $absentDates,
                'holiday_dates' => array_unique($holidayDates)
            ];
        }

        echo json_encode(['success' => true, 'data' => $results]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>

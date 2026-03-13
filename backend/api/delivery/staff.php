<?php
require_once '../../config/db.php';

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'list':
        try {
            $stmt = $conn->prepare("
                SELECT dp.*, u.username, es.store_name as warehouse_name 
                FROM delivery_persons dp 
                LEFT JOIN users u ON dp.user_id = u.id 
                LEFT JOIN external_stores es ON dp.warehouse_id = es.id 
                ORDER BY dp.id DESC
            ");
            $stmt->execute();
            $staff = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $staff]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    case 'add':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || empty($data['name']) || empty($data['mobile'])) {
            echo json_encode(['success' => false, 'error' => 'Name and Mobile are required']);
            exit;
        }

        try {
            $conn->beginTransaction();

            // First check if mobile/username already exists in users table
            $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
            $stmt->execute([$data['mobile']]);
            if ($stmt->fetch()) {
                throw new Exception("Mobile number already exists as a username in the system.");
            }

            // Create user for delivery staff
            $defaultPassword = password_hash($data['mobile'], PASSWORD_DEFAULT);
            $stmt = $conn->prepare("INSERT INTO users (name, username, password, role, mobile_number, account_status) VALUES (?, ?, ?, 'delivery', ?, 'active') RETURNING id");
            $stmt->execute([
                $data['name'], 
                $data['mobile'], 
                $defaultPassword, 
                $data['mobile']
            ]);
            $userId = $stmt->fetchColumn();

            // Insert into delivery_persons
            $stmt = $conn->prepare("
                INSERT INTO delivery_persons 
                (user_id, name, mobile, address, vehicle_details, warehouse_id, status) 
                VALUES (?, ?, ?, ?, ?, ?, 'Active')
            ");
            $stmt->execute([
                $userId,
                $data['name'],
                $data['mobile'],
                $data['address'] ?? null,
                $data['vehicle_details'] ?? null,
                $data['warehouse_id'] ?? null
            ]);

            $conn->commit();
            echo json_encode(['success' => true, 'message' => 'Delivery staff added successfully. Password is their mobile number.']);
        } catch(Exception $e) {
            $conn->rollBack();
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    case 'update':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || empty($data['id'])) {
            echo json_encode(['success' => false, 'error' => 'Missing data']);
            exit;
        }

        try {
            $conn->beginTransaction();

            // Update delivery_persons
            $stmt = $conn->prepare("
                UPDATE delivery_persons 
                SET name = ?, mobile = ?, address = ?, vehicle_details = ?, warehouse_id = ?
                WHERE id = ? RETURNING user_id
            ");
            $stmt->execute([
                $data['name'],
                $data['mobile'],
                $data['address'] ?? null,
                $data['vehicle_details'] ?? null,
                $data['warehouse_id'] ?? null,
                $data['id']
            ]);
            $userId = $stmt->fetchColumn();

            // Also update users table name and mobile
            if ($userId) {
                // Ignore username conflict if they are not changing it, or handle it simply:
                // We won't update username here to keep it simple, just name and mobile_number
                $stmt = $conn->prepare("UPDATE users SET name = ?, mobile_number = ? WHERE id = ?");
                $stmt->execute([$data['name'], $data['mobile'], $userId]);
            }

            $conn->commit();
            echo json_encode(['success' => true, 'message' => 'Delivery staff updated successfully']);
        } catch(Exception $e) {
            $conn->rollBack();
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    case 'toggle_status':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || empty($data['id'])) {
            echo json_encode(['success' => false, 'error' => 'Missing data']);
            exit;
        }

        try {
            $conn->beginTransaction();

            $stmt = $conn->prepare("SELECT status, user_id FROM delivery_persons WHERE id = ?");
            $stmt->execute([$data['id']]);
            $staff = $stmt->fetch();

            if (!$staff) throw new Exception("Staff not found");

            $newStatus = ($staff['status'] === 'Active') ? 'Inactive' : 'Active';

            $stmt = $conn->prepare("UPDATE delivery_persons SET status = ? WHERE id = ?");
            $stmt->execute([$newStatus, $data['id']]);

            if ($staff['user_id']) {
                $userStatus = ($newStatus === 'Active') ? 'active' : 'deactivated';
                $stmt = $conn->prepare("UPDATE users SET account_status = ? WHERE id = ?");
                $stmt->execute([$userStatus, $staff['user_id']]);
            }

            $conn->commit();
            echo json_encode(['success' => true, 'message' => 'Status updated successfully', 'newStatus' => $newStatus]);
        } catch(Exception $e) {
            $conn->rollBack();
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(['success' => false, 'error' => 'Invalid action']);
}
?>

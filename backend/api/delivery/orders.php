<?php
require_once '../../config/db.php';

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'list':
        try {
            $stmt = $conn->prepare("
                SELECT 
                    o.id as order_id, o.order_number, o.total_amount, o.order_date, o.status as order_system_status,
                    c.id as client_id, c.name as client_name, c.address as client_address,
                    d.id as delivery_order_id, d.delivery_person_id, d.delivery_status, d.assigned_date, d.delivery_priority,
                    dp.name as delivery_person_name,
                    (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
                FROM orders o
                LEFT JOIN clients c ON o.client_id = c.id
                LEFT JOIN delivery_orders d ON o.id = d.order_id
                LEFT JOIN delivery_persons dp ON d.delivery_person_id = dp.id
                ORDER BY o.id DESC
            ");
            $stmt->execute();
            $orders = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $orders]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    case 'assign':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || empty($data['order_id']) || empty($data['client_id'])) {
            echo json_encode(['success' => false, 'error' => 'Order ID and Client ID are required']);
            exit;
        }

        try {
            $conn->beginTransaction();

            // Check if already assigned
            $stmt = $conn->prepare("SELECT id FROM delivery_orders WHERE order_id = ?");
            $stmt->execute([$data['order_id']]);
            $existing = $stmt->fetch();

            if ($existing) {
                // Update
                $stmt = $conn->prepare("
                    UPDATE delivery_orders 
                    SET delivery_person_id = ?, assigned_date = ?, delivery_priority = ?, delivery_status = ? 
                    WHERE order_id = ?
                ");
                $stmt->execute([
                    $data['delivery_person_id'],
                    $data['assigned_date'] ? $data['assigned_date'] : null,
                    $data['delivery_priority'] ?? 'Normal',
                    $data['delivery_status'] ?? 'Pending',
                    $data['order_id']
                ]);
            } else {
                // Insert
                $stmt = $conn->prepare("
                    INSERT INTO delivery_orders 
                    (order_id, client_id, delivery_person_id, assigned_date, delivery_priority, delivery_status) 
                    VALUES (?, ?, ?, ?, ?, ?)
                ");
                $stmt->execute([
                    $data['order_id'],
                    $data['client_id'],
                    $data['delivery_person_id'],
                    $data['assigned_date'] ? $data['assigned_date'] : null,
                    $data['delivery_priority'] ?? 'Normal',
                    $data['delivery_status'] ?? 'Pending'
                ]);
            }

            // Also log the action if status is updated to something active
            if (isset($data['delivery_status']) && $data['delivery_status'] !== 'Pending') {
                $stmt = $conn->prepare("
                    INSERT INTO delivery_logs (order_id, delivery_person_id, delivery_status, remarks)
                    VALUES (?, ?, ?, 'Warehouse Status Update')
                ");
                $stmt->execute([
                    $data['order_id'],
                    $data['delivery_person_id'],
                    $data['delivery_status']
                ]);
            }

            $conn->commit();
            echo json_encode(['success' => true, 'message' => 'Delivery order assigned/updated successfully']);
        } catch(Exception $e) {
            $conn->rollBack();
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    case 'items':
        $orderId = $_GET['order_id'] ?? null;
        if (!$orderId) {
            echo json_encode(['success' => false, 'error' => 'Order ID required']);
            exit;
        }
        try {
            $stmt = $conn->prepare("
                SELECT oi.*, p.name as product_name
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            ");
            $stmt->execute([$orderId]);
            $items = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $items]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(['success' => false, 'error' => 'Invalid action']);
}
?>

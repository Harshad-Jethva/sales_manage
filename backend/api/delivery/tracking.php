<?php
require_once '../../config/db.php';

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'map_data':
        try {
            $stmt = $conn->prepare("
                SELECT 
                    dt.latitude, dt.longitude, dt.updated_at,
                    dp.id as delivery_person_id, dp.name, dp.mobile,
                    (SELECT COUNT(*) FROM delivery_orders d WHERE d.delivery_person_id = dp.id AND d.delivery_status NOT IN ('Delivered', 'Failed Delivery')) as active_orders
                FROM delivery_persons dp
                JOIN (
                    SELECT delivery_person_id, MAX(updated_at) as max_time
                    FROM delivery_tracking
                    WHERE updated_at >= NOW() - INTERVAL '24 hour'
                    GROUP BY delivery_person_id
                ) latest ON dp.id = latest.delivery_person_id
                JOIN delivery_tracking dt ON latest.delivery_person_id = dt.delivery_person_id AND latest.max_time = dt.updated_at
                WHERE dp.status = 'Active'
            ");
            $stmt->execute();
            $tracking = $stmt->fetchAll();
            echo json_encode(['success' => true, 'data' => $tracking]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    case 'get_history':
        $delivery_person_id = $_GET['delivery_person_id'] ?? null;
        $date = $_GET['date'] ?? date('Y-m-d');
        
        if (!$delivery_person_id) {
            echo json_encode(['success' => false, 'error' => 'Delivery Person ID required']);
            exit;
        }
        
        try {
            $stmt = $conn->prepare("
                SELECT latitude, longitude, updated_at 
                FROM delivery_tracking 
                WHERE delivery_person_id = ? AND DATE(updated_at) = ?
                ORDER BY updated_at ASC
            ");
            $stmt->execute([$delivery_person_id, $date]);
            $locations = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $locations]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    case 'get_staff':
        try {
            $stmt = $conn->prepare("
                SELECT id as delivery_person_id, name 
                FROM delivery_persons 
                WHERE status = 'Active'
            ");
            $stmt->execute();
            $staff = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $staff]);
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    case 'dashboard_stats':
        try {
            $stmt = $conn->prepare("
                SELECT 
                    COUNT(*) FILTER (WHERE delivery_status IN ('Accepted', 'Out for Delivery')) as active_deliveries,
                    COUNT(*) FILTER (WHERE delivery_status = 'Pending') as pending_deliveries,
                    COUNT(*) FILTER (WHERE delivery_status = 'Delivered') as completed_deliveries,
                    COUNT(*) FILTER (WHERE delivery_status = 'Failed Delivery') as failed_deliveries
                FROM delivery_orders
            ");
            $stmt->execute();
            $stats = $stmt->fetch();
            echo json_encode(['success' => true, 'data' => $stats]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(['success' => false, 'error' => 'Invalid action']);
}
?>

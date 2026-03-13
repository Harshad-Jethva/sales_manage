<?php
require_once '../../config/db.php';

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'summary':
        $personId = $_GET['person_id'] ?? '';
        $startDate = $_GET['start_date'] ?? '';
        $endDate = $_GET['end_date'] ?? '';

        $whereConds = [];
        $params = [];

        if ($personId) {
            $whereConds[] = "delivery_person_id = ?";
            $params[] = $personId;
        }
        if ($startDate) {
            $whereConds[] = "DATE(d.updated_at) >= ?";
            $params[] = $startDate;
        }
        if ($endDate) {
            $whereConds[] = "DATE(d.updated_at) <= ?";
            $params[] = $endDate;
        }

        $whereSQL = count($whereConds) > 0 ? "WHERE " . implode(' AND ', $whereConds) : '';

        try {
            $stmt = $conn->prepare("
                SELECT 
                    dp.name as delivery_name,
                    COUNT(d.id) as total_assigned,
                    COUNT(d.id) FILTER (WHERE d.delivery_status = 'Delivered') as total_completed,
                    COUNT(d.id) FILTER (WHERE d.delivery_status = 'Failed Delivery') as total_failed,
                    COUNT(d.id) FILTER (WHERE d.delivery_status IN ('Pending', 'Accepted', 'Out for Delivery')) as total_pending
                FROM delivery_persons dp
                LEFT JOIN delivery_orders d ON dp.id = d.delivery_person_id
                $whereSQL
                GROUP BY dp.name
                ORDER BY total_completed DESC
            ");
            $stmt->execute($params);
            $performance = $stmt->fetchAll();

            // Fetch detailed list
            $listSQL = "
                SELECT 
                    o.order_number, d.delivery_status, dp.name as delivery_name, d.updated_at
                FROM delivery_orders d
                JOIN orders o ON d.order_id = o.id
                JOIN delivery_persons dp ON d.delivery_person_id = dp.id
                $whereSQL
                ORDER BY d.updated_at DESC
                LIMIT 100
            ";
            $stmtList = $conn->prepare($listSQL);
            $stmtList->execute($params);
            $deliveries = $stmtList->fetchAll();

            echo json_encode(['success' => true, 'performance' => $performance, 'deliveries' => $deliveries]);
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(['success' => false, 'error' => 'Invalid action']);
}
?>

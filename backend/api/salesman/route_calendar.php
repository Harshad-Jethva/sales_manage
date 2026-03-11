<?php
require_once '../../config/db.php';

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get_my_routes':
        getMyRoutes($conn);
        break;
    case 'get_route_details':
        getRouteDetails($conn);
        break;
    case 'update_visit_status':
        updateVisitStatus($conn);
        break;
    case 'update_visit_notes':
        updateVisitNotes($conn);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

function getMyRoutes($conn) {
    $salesman_id = $_GET['salesman_id'] ?? '';
    if (empty($salesman_id)) {
        echo json_encode(['success' => false, 'message' => 'Missing salesman_id']);
        return;
    }

    try {
        $stmt = $conn->prepare("SELECT route_id, route_date FROM route_plans WHERE salesman_id = ? ORDER BY route_date DESC");
        $stmt->execute([$salesman_id]);
        $routes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch client counts for each route
        foreach ($routes as &$route) {
            $countStmt = $conn->prepare("SELECT COUNT(*) FROM route_clients WHERE route_id = ?");
            $countStmt->execute([$route['route_id']]);
            $route['client_count'] = $countStmt->fetchColumn();
            
            // Status summary
            $statusStmt = $conn->prepare("SELECT status, COUNT(*) as count FROM route_clients WHERE route_id = ? GROUP BY status");
            $statusStmt->execute([$route['route_id']]);
            $route['status_summary'] = $statusStmt->fetchAll(PDO::FETCH_ASSOC);
        }

        echo json_encode(['success' => true, 'data' => $routes]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function getRouteDetails($conn) {
    $route_id = $_GET['route_id'] ?? '';
    if (empty($route_id)) {
        echo json_encode(['success' => false, 'message' => 'Missing route_id']);
        return;
    }

    try {
        // Fetch Plan Info
        $planStmt = $conn->prepare("SELECT r.route_id, r.route_date, r.salesman_id, u.name as salesman_name 
                                   FROM route_plans r 
                                   JOIN users u ON r.salesman_id = u.id 
                                   WHERE r.route_id = ?");
        $planStmt->execute([$route_id]);
        $plan = $planStmt->fetch(PDO::FETCH_ASSOC);

        if (!$plan) {
            echo json_encode(['success' => false, 'message' => 'Route not found']);
            return;
        }

        // Fetch Clients with Details and Bills
        $clientSql = "SELECT rc.id as visit_id, rc.client_id, rc.area_name, rc.outstanding_amount, rc.status, rc.notes,
                             c.name as client_name, c.phone as mobile_number, c.address
                      FROM route_clients rc
                      JOIN clients c ON rc.client_id = c.id
                      WHERE rc.route_id = ?
                      ORDER BY rc.id ASC";
        $clientStmt = $conn->prepare($clientSql);
        $clientStmt->execute([$route_id]);
        $clients = $clientStmt->fetchAll(PDO::FETCH_ASSOC);

        // Fetch Bills for each client
        foreach ($clients as &$client) {
            $billSql = "SELECT bill_number, bill_date, total_amount, (total_amount - COALESCE(paid_amount, 0)) as pending_amount 
                        FROM bills 
                        WHERE client_id = ? AND (total_amount - COALESCE(paid_amount, 0)) > 0 AND LOWER(payment_method) = 'credit'
                        ORDER BY bill_date DESC";
            $billStmt = $conn->prepare($billSql);
            $billStmt->execute([$client['client_id']]);
            $client['bills'] = $billStmt->fetchAll(PDO::FETCH_ASSOC);
            $client['pending_bill_amount'] = array_sum(array_column($client['bills'], 'pending_amount'));
        }

        echo json_encode([
            'success' => true, 
            'data' => [
                'plan' => $plan,
                'clients' => $clients
            ]
        ]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function updateVisitStatus($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    if (empty($data['visit_id']) || empty($data['status'])) {
        echo json_encode(['success' => false, 'message' => 'Missing parameters']);
        return;
    }

    try {
        $stmt = $conn->prepare("UPDATE route_clients SET status = ? WHERE id = ?");
        $stmt->execute([$data['status'], $data['visit_id']]);
        echo json_encode(['success' => true, 'message' => 'Status updated successfully']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function updateVisitNotes($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    if (empty($data['visit_id'])) {
        echo json_encode(['success' => false, 'message' => 'Missing visit_id']);
        return;
    }

    try {
        $stmt = $conn->prepare("UPDATE route_clients SET notes = ? WHERE id = ?");
        $stmt->execute([$data['notes'] ?? '', $data['visit_id']]);
        echo json_encode(['success' => true, 'message' => 'Notes updated successfully']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}
?>

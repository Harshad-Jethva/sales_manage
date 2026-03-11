<?php
require_once '../config/db.php';
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");

$action = $_GET['action'] ?? '';

if ($action === 'get_todays_route') {
    $salesman_id = $_GET['salesman_id'] ?? null;
    $date = date('Y-m-d');
    
    if (!$salesman_id) {
        echo json_encode(['success' => false, 'message' => 'Missing salesman_id']);
        exit;
    }

    try {
        // Find today's route
        $stmt = $conn->prepare("SELECT route_id, route_date FROM route_plans WHERE salesman_id = ? AND route_date = ?");
        $stmt->execute([$salesman_id, $date]);
        $route = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$route) {
            echo json_encode(['success' => false, 'message' => 'No route assigned for today']);
            exit;
        }

        $route_id = $route['route_id'];

        // Get clients with location
        // Assuming clients table has latitude/longitude, if not, we default to 0
        $clients_query = "
            SELECT 
                rc.client_id, 
                c.name as client_name, 
                c.address, 
                c.phone as mobile_number, 
                c.outstanding_balance as outstanding_amount,
                COALESCE(rc.visit_status, 'pending') as visit_status,
                c.latitude, 
                c.longitude
            FROM route_clients rc
            JOIN clients c ON rc.client_id = c.id
            WHERE rc.route_id = ?
            ORDER BY rc.client_id ASC
        ";
        $stmtC = $conn->prepare($clients_query);
        $stmtC->execute([$route_id]);
        $clients = $stmtC->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'data' => [
                'route_id' => $route_id,
                'clients' => $clients
            ]
        ]);
    } catch (PDOException $e) {
        // In case columns like latitude/longitude or visit_status don't exist yet:
        // Let's add them gracefully if they throw errors
        if(strpos($e->getMessage(), 'latitude') !== false || strpos($e->getMessage(), 'visit_status') !== false) {
            try {
                $conn->exec("ALTER TABLE clients ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8)");
                $conn->exec("ALTER TABLE clients ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8)");
                $conn->exec("ALTER TABLE route_clients ADD COLUMN IF NOT EXISTS visit_status VARCHAR(50) DEFAULT 'pending'");
                
                // Retry query
                $stmtC = $conn->prepare($clients_query);
                $stmtC->execute([$route_id]);
                $clients = $stmtC->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'success' => true,
                    'data' => [
                        'route_id' => $route_id,
                        'clients' => $clients
                    ]
                ]);
            } catch(PDOException $e2) {
                echo json_encode(['success' => false, 'message' => $e2->getMessage()]);
            }
        } else {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }
} elseif ($action === 'verify_visit') {
    $data = json_decode(file_get_contents("php://input"), true);
    $salesman_id = $data['salesman_id'] ?? null;
    $client_id = $data['client_id'] ?? null;
    $route_id = $data['route_id'] ?? null;
    $lat = $data['latitude'] ?? null;
    $lng = $data['longitude'] ?? null;
    $status = $data['status'] ?? 'visited'; // visited or skipped

    if (!$salesman_id || !$client_id || !$route_id || !$lat || !$lng) {
        echo json_encode(['success' => false, 'message' => 'Missing parameters']);
        exit;
    }

    try {
        // Insert Visit Log
        $stmt = $conn->prepare("INSERT INTO visit_logs (salesman_id, client_id, route_id, checkin_latitude, checkin_longitude, checkin_time) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)");
        $stmt->execute([$salesman_id, $client_id, $route_id, $lat, $lng]);

        // Update Route Client Status
        $stmtU = $conn->prepare("UPDATE route_clients SET visit_status = ? WHERE route_id = ? AND client_id = ?");
        $stmtU->execute([$status, $route_id, $client_id]);

        echo json_encode(['success' => true, 'message' => 'Visit verified and logged']);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid action']);
}

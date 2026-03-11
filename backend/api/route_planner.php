<?php
require_once '../config/db.php';

// Enable error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get_areas':
        getAreas($conn);
        break;
    case 'get_clients':
        getClients($conn);
        break;
    case 'get_client_bills':
        getClientBills($conn);
        break;
    case 'save_route':
        saveRoute($conn);
        break;
    case 'get_routes':
        getRoutes($conn);
        break;
    case 'update_route':
        updateRoute($conn);
        break;
    case 'get_route_details':
        getRouteDetails($conn);
        break;
    case 'save_route_pdf':
        saveRoutePdf($conn);
        break;
    case 'send_whatsapp':
        sendWhatsapp($conn);
        break;
    case 'delete_route':
        deleteRoute($conn);
        break;
    default:
        echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
}

function getAreas($conn) {
    try {
        $stmt = $conn->query("SELECT DISTINCT area FROM clients WHERE area IS NOT NULL AND area != '' ORDER BY area ASC");
        $areas = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo json_encode(['status' => 'success', 'data' => $areas]);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

function getClients($conn) {
    try {
        $areas = $_GET['areas'] ?? '';
        if (empty($areas)) {
            echo json_encode(['status' => 'success', 'data' => []]);
            return;
        }

        $areaArray = explode(',', $areas);
        $placeholders = implode(',', array_fill(0, count($areaArray), '?'));

        $sql = "SELECT id as client_id, name as client_name, area as area_name, phone as mobile_number, address, outstanding_balance as outstanding_amount 
                FROM clients 
                WHERE area IN ($placeholders) 
                ORDER BY area_name ASC, client_name ASC";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute($areaArray);
        $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Enhance with pending bills
        $clientIds = array_column($clients, 'client_id');
        $billsByClient = [];
        
        if (count($clientIds) > 0) {
            $idPlaceholders = implode(',', array_fill(0, count($clientIds), '?'));
            $billSql = "SELECT client_id, bill_number, bill_date, total_amount, paid_amount, (total_amount - COALESCE(paid_amount, 0)) as pending_amount 
                        FROM bills 
                        WHERE client_id IN ($idPlaceholders) AND (total_amount - COALESCE(paid_amount, 0)) > 0 AND LOWER(payment_method) = 'credit'";
            $billStmt = $conn->prepare($billSql);
            $billStmt->execute($clientIds);
            
            while ($row = $billStmt->fetch(PDO::FETCH_ASSOC)) {
                $cId = $row['client_id'];
                if (!isset($billsByClient[$cId])) {
                    $billsByClient[$cId] = [];
                }
                $billsByClient[$cId][] = $row;
            }
        }

        foreach ($clients as &$c) {
            $cId = $c['client_id'];
            $c['pending_bills_list'] = $billsByClient[$cId] ?? [];
            $c['pending_bills_count'] = count($c['pending_bills_list']);
        }

        echo json_encode(['status' => 'success', 'data' => $clients]);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

function saveRoute($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (empty($data['salesman_id']) || empty($data['route_date']) || empty($data['clients'])) {
        echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
        return;
    }

    try {
        $conn->beginTransaction();

        // Check for existing route
        $checkSql = "SELECT route_id FROM route_plans WHERE salesman_id = ? AND route_date = ?";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->execute([$data['salesman_id'], $data['route_date']]);
        $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if ($existing) {
            throw new Exception("A route already exists for this salesman on this date.");
        }

        // Insert Route Plan
        $insertPlan = $conn->prepare("INSERT INTO route_plans (salesman_id, route_date, created_by) VALUES (?, ?, ?)");
        $insertPlan->execute([$data['salesman_id'], $data['route_date'], 1]);
        $routeId = $conn->lastInsertId('route_plans_route_id_seq');

        // Insert Clients
        $insertClient = $conn->prepare("INSERT INTO route_clients (route_id, client_id, area_name, outstanding_amount) VALUES (?, ?, ?, ?)");
        
        foreach ($data['clients'] as $c) {
            $insertClient->execute([
                $routeId,
                $c['client_id'],
                $c['area_name'] ?? '',
                $c['outstanding_amount'] ?? 0
            ]);
        }

        $conn->commit();
        echo json_encode(['status' => 'success', 'message' => 'Route plan saved successfully', 'route_id' => $routeId]);

    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

function updateRoute($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (empty($data['route_id']) || empty($data['salesman_id']) || empty($data['route_date']) || empty($data['clients'])) {
        echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
        return;
    }

    try {
        $conn->beginTransaction();

        // Update Route Plan
        $updatePlan = $conn->prepare("UPDATE route_plans SET salesman_id = ?, route_date = ? WHERE route_id = ?");
        $updatePlan->execute([$data['salesman_id'], $data['route_date'], $data['route_id']]);

        // Delete old clients
        $deleteClients = $conn->prepare("DELETE FROM route_clients WHERE route_id = ?");
        $deleteClients->execute([$data['route_id']]);

        // Insert New Clients
        $insertClient = $conn->prepare("INSERT INTO route_clients (route_id, client_id, area_name, outstanding_amount) VALUES (?, ?, ?, ?)");
        
        foreach ($data['clients'] as $c) {
            $insertClient->execute([
                $data['route_id'],
                $c['client_id'],
                $c['area_name'] ?? '',
                $c['outstanding_amount'] ?? 0
            ]);
        }

        $conn->commit();
        echo json_encode(['status' => 'success', 'message' => 'Route plan updated successfully', 'route_id' => $data['route_id']]);

    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

function getRoutes($conn) {
    try {
        $search = $_GET['search'] ?? '';

        $sql = "SELECT r.route_id, r.salesman_id, u.name as salesman_name, u.mobile_number as salesman_phone, r.route_date, r.created_at,
                (SELECT COUNT(*) FROM route_clients rc WHERE rc.route_id = r.route_id) as client_count,
                (SELECT COUNT(*) FROM route_clients rc WHERE rc.route_id = r.route_id AND rc.visit_status = 'visited') as visited_count,
                (SELECT COUNT(*) FROM route_clients rc WHERE rc.route_id = r.route_id AND rc.visit_status = 'skipped') as skipped_count,
                r.whatsapp_status
                FROM route_plans r
                JOIN users u ON r.salesman_id = u.id
                WHERE 1=1";
        
        $params = [];
        if (!empty($search)) {
            $sql .= " AND (u.name ILIKE ? OR CAST(r.route_date AS TEXT) ILIKE ?)";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }

        $sql .= " ORDER BY r.route_date DESC, r.created_at DESC";
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        $routes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['status' => 'success', 'data' => $routes]);

    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

function deleteRoute($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    if (empty($data['route_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'Missing route_id']);
        return;
    }
    
    try {
        $stmt = $conn->prepare("DELETE FROM route_plans WHERE route_id = ?");
        $stmt->execute([$data['route_id']]);
        echo json_encode(['status' => 'success', 'message' => 'Route deleted successfully']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

function getRouteDetails($conn) {
    try {
        $routeId = $_GET['route_id'] ?? '';
        if (empty($routeId)) {
            echo json_encode(['status' => 'error', 'message' => 'Missing route_id']);
            return;
        }

        // 1. Fetch Plan Details
        $planSql = "SELECT r.route_id, r.route_date, r.salesman_id, u.name as salesman_name, u.mobile_number 
                    FROM route_plans r 
                    JOIN users u ON r.salesman_id = u.id 
                    WHERE r.route_id = ?";
        $planStmt = $conn->prepare($planSql);
        $planStmt->execute([$routeId]);
        $plan = $planStmt->fetch(PDO::FETCH_ASSOC);

        if (!$plan) {
            echo json_encode(['status' => 'error', 'message' => 'Route not found']);
            return;
        }

        // 2. Fetch Clients & Pending Bills
        $clientSql = "SELECT rc.client_id, rc.area_name, c.name as client_name, c.phone as mobile_number, c.address, c.outstanding_balance as outstanding_amount
                      FROM route_clients rc
                      JOIN clients c ON rc.client_id = c.id
                      WHERE rc.route_id = ?
                      ORDER BY rc.area_name ASC, c.name ASC";
        $clientStmt = $conn->prepare($clientSql);
        $clientStmt->execute([$routeId]);
        $clients = $clientStmt->fetchAll(PDO::FETCH_ASSOC);

        $clientIds = array_column($clients, 'client_id');
        $billsByClient = [];
        
        if (count($clientIds) > 0) {
            $idPlaceholders = implode(',', array_fill(0, count($clientIds), '?'));
            $billSql = "SELECT client_id, bill_number, bill_date, total_amount, paid_amount, (total_amount - COALESCE(paid_amount, 0)) as pending_amount 
                        FROM bills 
                        WHERE client_id IN ($idPlaceholders) AND (total_amount - COALESCE(paid_amount, 0)) > 0 AND LOWER(payment_method) = 'credit'";
            $billStmt = $conn->prepare($billSql);
            $billStmt->execute($clientIds);
            
            while ($row = $billStmt->fetch(PDO::FETCH_ASSOC)) {
                $cId = $row['client_id'];
                if (!isset($billsByClient[$cId])) {
                    $billsByClient[$cId] = [];
                }
                $billsByClient[$cId][] = $row;
            }
        }

        foreach ($clients as &$c) {
            $cId = $c['client_id'];
            $c['pending_bills_list'] = $billsByClient[$cId] ?? [];
            $c['pending_bills_count'] = count($c['pending_bills_list']);
        }

        echo json_encode([
            'status' => 'success',
            'data' => [
                'plan' => $plan,
                'clients' => $clients
            ]
        ]);

    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

function saveRoutePdf($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (empty($data['route_id']) || empty($data['pdf_base64'])) {
        echo json_encode(['status' => 'error', 'message' => 'Missing parameters for saving PDF']);
        return;
    }

    $routeId = $data['route_id'];
    $pdfBase64 = $data['pdf_base64'];
    $salesmanName = $data['salesman_name'] ?? 'Salesman';
    $routeDate = $data['route_date'] ?? date('Y-m-d');

    try {
        $uploadDir = '../uploads/routes/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $pdfBase64 = str_replace('data:application/pdf;base64,', '', $pdfBase64);
        $pdfBase64 = str_replace(' ', '+', $pdfBase64);
        $pdfDecoded = base64_decode($pdfBase64);

        $cleanName = preg_replace('/[^A-Za-z0-9\-]/', '_', $salesmanName);
        $fileName = "RoutePlan_{$cleanName}_{$routeDate}_{$routeId}.pdf";
        $filePath = $uploadDir . $fileName;

        if (file_put_contents($filePath, $pdfDecoded)) {
            $dbPath = "uploads/routes/" . $fileName;
            
            // Check if column pdf_path exists in route_plans, if not, create it
            try {
                $conn->exec("ALTER TABLE route_plans ADD COLUMN pdf_path VARCHAR(255)");
                $conn->exec("ALTER TABLE route_plans ADD COLUMN whatsapp_status VARCHAR(50) DEFAULT 'Pending'");
            } catch(PDOException $e) {}

            $stmt = $conn->prepare("UPDATE route_plans SET pdf_path = :path WHERE route_id = :id");
            $stmt->execute([':path' => $dbPath, ':id' => $routeId]);

            echo json_encode(['status' => 'success', 'message' => 'PDF saved successfully', 'pdf_url' => $dbPath]);
        } else {
            throw new Exception("Failed to save PDF to disk.");
        }
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

function sendWhatsapp($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    if (empty($data['route_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'Missing route_id']);
        return;
    }

    $routeId = $data['route_id'];

    try {
        // We will call local automation service
        $url = 'http://localhost:5000/send-route-whatsapp';
        $payload = json_encode(['route_id' => $routeId]);

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200) {
            $resData = json_decode($response, true);
            if ($resData['success']) {
                try {
                    $conn->prepare("UPDATE route_plans SET whatsapp_status = 'Sent' WHERE route_id = ?")->execute([$routeId]);
                } catch(PDOException $e){}
                echo json_encode(['status' => 'success', 'message' => 'Route plan sent via WhatsApp successfully!']);
            } else {
                echo json_encode(['status' => 'error', 'message' => $resData['message'] ?? 'Failed to send WhatsApp via service']);
            }
        } else {
            echo json_encode(['status' => 'error', 'message' => 'WhatsApp automation service is offline (Port 5000)']);
        }
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
?>

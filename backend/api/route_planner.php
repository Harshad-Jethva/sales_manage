<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/lib/api_bootstrap.php';

api_bootstrap(['GET', 'POST']);
$currentUser = api_require_auth($conn, ['admin', 'warehouse']);

$action = trim((string)($_GET['action'] ?? ''));
$method = $_SERVER['REQUEST_METHOD'];

if ($action === '') {
    api_send_json(400, ['success' => false, 'message' => 'Action is required']);
}

try {
    switch ($action) {
        case 'get_areas':
            assertMethod($method, 'GET');
            getAreas($conn);
            break;
        case 'get_clients':
            assertMethod($method, 'GET');
            getClients($conn);
            break;
        case 'get_client_bills':
            assertMethod($method, 'GET');
            getClientBills($conn);
            break;
        case 'get_routes':
            assertMethod($method, 'GET');
            getRoutes($conn);
            break;
        case 'get_route_details':
            assertMethod($method, 'GET');
            getRouteDetails($conn);
            break;
        case 'save_route':
            assertMethod($method, 'POST');
            saveRoute($conn, $currentUser);
            break;
        case 'update_route':
            assertMethod($method, 'POST');
            updateRoute($conn);
            break;
        case 'delete_route':
            assertMethod($method, 'POST');
            deleteRoute($conn);
            break;
        case 'save_route_pdf':
            assertMethod($method, 'POST');
            saveRoutePdf($conn);
            break;
        case 'send_whatsapp':
            assertMethod($method, 'POST');
            sendWhatsapp($conn);
            break;
        default:
            api_send_json(400, ['success' => false, 'message' => 'Invalid action']);
    }
} catch (Throwable $exception) {
    api_handle_exception($exception, 'Route planner request failed', 500, ['action' => $action]);
}

function assertMethod(string $actualMethod, string $expectedMethod): void
{
    if (strtoupper($actualMethod) !== strtoupper($expectedMethod)) {
        api_send_json(405, ['success' => false, 'message' => 'Method not allowed for this action']);
    }
}

function getAreas(PDO $conn): void
{
    $stmt = $conn->query("SELECT DISTINCT area FROM clients WHERE area IS NOT NULL AND TRIM(area) <> '' ORDER BY area ASC");
    api_send_json(200, ['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_COLUMN)]);
}

function getClients(PDO $conn): void
{
    $areas = trim((string)($_GET['areas'] ?? ''));
    if ($areas === '') {
        api_send_json(200, ['success' => true, 'data' => []]);
    }

    $areaArray = array_values(array_filter(array_map('trim', explode(',', $areas))));
    if (empty($areaArray)) {
        api_send_json(200, ['success' => true, 'data' => []]);
    }

    $placeholders = implode(',', array_fill(0, count($areaArray), '?'));
    $sql = "SELECT id AS client_id, name AS client_name, area AS area_name, phone AS mobile_number, address, outstanding_balance AS outstanding_amount
            FROM clients
            WHERE area IN ($placeholders)
            ORDER BY area_name ASC, client_name ASC";

    $stmt = $conn->prepare($sql);
    $stmt->execute($areaArray);
    $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);

    enrichClientsWithPendingBills($conn, $clients);
    api_send_json(200, ['success' => true, 'data' => $clients]);
}

function getClientBills(PDO $conn): void
{
    $clientId = isset($_GET['client_id']) ? (int)$_GET['client_id'] : 0;
    if ($clientId <= 0) {
        api_send_json(400, ['success' => false, 'message' => 'Invalid client_id']);
    }

    $stmt = $conn->prepare(
        "SELECT client_id, bill_number, bill_date, total_amount, paid_amount, (total_amount - COALESCE(paid_amount, 0)) AS pending_amount
         FROM bills
         WHERE client_id = ? AND (total_amount - COALESCE(paid_amount, 0)) > 0
         ORDER BY bill_date DESC"
    );
    $stmt->execute([$clientId]);

    api_send_json(200, ['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
}

function saveRoute(PDO $conn, array $currentUser): void
{
    $data = api_get_json_input();
    $missing = api_require_fields($data, ['salesman_id', 'route_date', 'clients']);
    if (!empty($missing)) {
        api_send_json(400, ['success' => false, 'message' => 'Missing required fields', 'fields' => $missing]);
    }

    $salesmanId = (int)$data['salesman_id'];
    $routeDate = trim((string)$data['route_date']);
    $clients = is_array($data['clients']) ? $data['clients'] : [];

    if ($salesmanId <= 0 || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $routeDate) || empty($clients)) {
        api_send_json(400, ['success' => false, 'message' => 'Invalid route payload']);
    }

    $conn->beginTransaction();
    try {
        $checkStmt = $conn->prepare("SELECT route_id FROM route_plans WHERE salesman_id = ? AND route_date = ? LIMIT 1");
        $checkStmt->execute([$salesmanId, $routeDate]);
        if ($checkStmt->fetch(PDO::FETCH_ASSOC)) {
            api_send_json(409, ['success' => false, 'message' => 'A route already exists for this salesman on this date']);
        }

        $insertPlan = $conn->prepare("INSERT INTO route_plans (salesman_id, route_date, created_by) VALUES (?, ?, ?)");
        $insertPlan->execute([$salesmanId, $routeDate, (int)$currentUser['id']]);
        $routeId = (int)$conn->lastInsertId('route_plans_route_id_seq');

        $insertClient = $conn->prepare("INSERT INTO route_clients (route_id, client_id, area_name, outstanding_amount) VALUES (?, ?, ?, ?)");
        foreach ($clients as $client) {
            $insertClient->execute([
                $routeId,
                (int)($client['client_id'] ?? 0),
                trim((string)($client['area_name'] ?? '')),
                (float)($client['outstanding_amount'] ?? 0),
            ]);
        }

        $conn->commit();
        api_send_json(201, ['success' => true, 'message' => 'Route plan saved successfully', 'route_id' => $routeId]);
    } catch (Throwable $exception) {
        if ($conn->inTransaction()) {
            $conn->rollBack();
        }
        throw $exception;
    }
}

function updateRoute(PDO $conn): void
{
    $data = api_get_json_input();
    $missing = api_require_fields($data, ['route_id', 'salesman_id', 'route_date', 'clients']);
    if (!empty($missing)) {
        api_send_json(400, ['success' => false, 'message' => 'Missing required fields', 'fields' => $missing]);
    }

    $routeId = (int)$data['route_id'];
    $salesmanId = (int)$data['salesman_id'];
    $routeDate = trim((string)$data['route_date']);
    $clients = is_array($data['clients']) ? $data['clients'] : [];

    if ($routeId <= 0 || $salesmanId <= 0 || empty($clients) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $routeDate)) {
        api_send_json(400, ['success' => false, 'message' => 'Invalid route payload']);
    }

    $conn->beginTransaction();
    try {
        $updatePlan = $conn->prepare("UPDATE route_plans SET salesman_id = ?, route_date = ? WHERE route_id = ?");
        $updatePlan->execute([$salesmanId, $routeDate, $routeId]);

        $deleteClients = $conn->prepare("DELETE FROM route_clients WHERE route_id = ?");
        $deleteClients->execute([$routeId]);

        $insertClient = $conn->prepare("INSERT INTO route_clients (route_id, client_id, area_name, outstanding_amount) VALUES (?, ?, ?, ?)");
        foreach ($clients as $client) {
            $insertClient->execute([
                $routeId,
                (int)($client['client_id'] ?? 0),
                trim((string)($client['area_name'] ?? '')),
                (float)($client['outstanding_amount'] ?? 0),
            ]);
        }

        $conn->commit();
        api_send_json(200, ['success' => true, 'message' => 'Route plan updated successfully', 'route_id' => $routeId]);
    } catch (Throwable $exception) {
        if ($conn->inTransaction()) {
            $conn->rollBack();
        }
        throw $exception;
    }
}

function getRoutes(PDO $conn): void
{
    $search = trim((string)($_GET['search'] ?? ''));
    $sql = "SELECT r.route_id, r.salesman_id, u.name AS salesman_name, u.mobile_number AS salesman_phone, r.route_date, r.created_at,
            (SELECT COUNT(*) FROM route_clients rc WHERE rc.route_id = r.route_id) AS client_count,
            (SELECT COUNT(*) FROM route_clients rc WHERE rc.route_id = r.route_id AND rc.visit_status = 'visited') AS visited_count,
            (SELECT COUNT(*) FROM route_clients rc WHERE rc.route_id = r.route_id AND rc.visit_status = 'skipped') AS skipped_count,
            COALESCE(r.whatsapp_status, 'Pending') AS whatsapp_status
            FROM route_plans r
            JOIN users u ON r.salesman_id = u.id
            WHERE 1=1";
    $params = [];

    if ($search !== '') {
        $sql .= " AND (u.name ILIKE ? OR CAST(r.route_date AS TEXT) ILIKE ?)";
        $searchParam = '%' . $search . '%';
        $params[] = $searchParam;
        $params[] = $searchParam;
    }

    $sql .= " ORDER BY r.route_date DESC, r.created_at DESC";
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);

    api_send_json(200, ['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
}

function deleteRoute(PDO $conn): void
{
    $data = api_get_json_input();
    $routeId = isset($data['route_id']) ? (int)$data['route_id'] : 0;
    if ($routeId <= 0) {
        api_send_json(400, ['success' => false, 'message' => 'Missing route_id']);
    }

    $stmt = $conn->prepare("DELETE FROM route_plans WHERE route_id = ?");
    $stmt->execute([$routeId]);
    api_send_json(200, ['success' => true, 'message' => 'Route deleted successfully']);
}

function getRouteDetails(PDO $conn): void
{
    $routeId = isset($_GET['route_id']) ? (int)$_GET['route_id'] : 0;
    if ($routeId <= 0) {
        api_send_json(400, ['success' => false, 'message' => 'Missing route_id']);
    }

    $planStmt = $conn->prepare(
        "SELECT r.route_id, r.route_date, r.salesman_id, u.name AS salesman_name, u.mobile_number
         FROM route_plans r
         JOIN users u ON r.salesman_id = u.id
         WHERE r.route_id = ?"
    );
    $planStmt->execute([$routeId]);
    $plan = $planStmt->fetch(PDO::FETCH_ASSOC);
    if (!$plan) {
        api_send_json(404, ['success' => false, 'message' => 'Route not found']);
    }

    $clientStmt = $conn->prepare(
        "SELECT rc.client_id, rc.area_name, c.name AS client_name, c.phone AS mobile_number, c.address, c.outstanding_balance AS outstanding_amount
         FROM route_clients rc
         JOIN clients c ON rc.client_id = c.id
         WHERE rc.route_id = ?
         ORDER BY rc.area_name ASC, c.name ASC"
    );
    $clientStmt->execute([$routeId]);
    $clients = $clientStmt->fetchAll(PDO::FETCH_ASSOC);

    enrichClientsWithPendingBills($conn, $clients);
    api_send_json(200, ['success' => true, 'data' => ['plan' => $plan, 'clients' => $clients]]);
}

function saveRoutePdf(PDO $conn): void
{
    $data = api_get_json_input();
    $missing = api_require_fields($data, ['route_id', 'pdf_base64']);
    if (!empty($missing)) {
        api_send_json(400, ['success' => false, 'message' => 'Missing required fields', 'fields' => $missing]);
    }

    $routeId = (int)$data['route_id'];
    $pdfBase64 = trim((string)$data['pdf_base64']);
    $salesmanName = trim((string)($data['salesman_name'] ?? 'Salesman'));
    $routeDate = trim((string)($data['route_date'] ?? date('Y-m-d')));

    if ($routeId <= 0 || $pdfBase64 === '') {
        api_send_json(400, ['success' => false, 'message' => 'Invalid PDF payload']);
    }

    if (preg_match('/^data:application\/pdf;.*base64,/', $pdfBase64, $matches)) {
        $pdfBase64 = substr($pdfBase64, strlen($matches[0]));
    }
    $pdfBase64 = str_replace(' ', '+', $pdfBase64);
    $pdfDecoded = base64_decode($pdfBase64, true);
    if ($pdfDecoded === false) {
        api_send_json(400, ['success' => false, 'message' => 'Invalid PDF data']);
    }

    $uploadDir = dirname(__DIR__) . '/uploads/routes/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0775, true);
    }

    $safeName = preg_replace('/[^A-Za-z0-9_-]/', '_', $salesmanName);
    $safeDate = preg_replace('/[^0-9-]/', '', $routeDate);
    $fileName = "RoutePlan_{$safeName}_{$safeDate}_{$routeId}.pdf";
    $filePath = $uploadDir . $fileName;

    if (file_put_contents($filePath, $pdfDecoded) === false) {
        api_send_json(500, ['success' => false, 'message' => 'Failed to save PDF file']);
    }

    $dbPath = 'uploads/routes/' . $fileName;
    ensureRoutePlannerColumns($conn);

    $stmt = $conn->prepare("UPDATE route_plans SET pdf_path = ? WHERE route_id = ?");
    $stmt->execute([$dbPath, $routeId]);

    api_send_json(200, ['success' => true, 'message' => 'PDF saved successfully', 'pdf_url' => $dbPath]);
}

function sendWhatsapp(PDO $conn): void
{
    $data = api_get_json_input();
    $routeId = isset($data['route_id']) ? (int)$data['route_id'] : 0;
    if ($routeId <= 0) {
        api_send_json(400, ['success' => false, 'message' => 'Missing route_id']);
    }

    $url = 'http://localhost:5000/send-route-whatsapp';
    $payload = json_encode(['route_id' => $routeId], JSON_UNESCAPED_UNICODE);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);

    $response = curl_exec($ch);
    $httpCode = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($response === false || $httpCode === 0) {
        api_send_json(502, ['success' => false, 'message' => 'WhatsApp automation service is unavailable', 'error' => $curlError]);
    }

    $responseData = json_decode((string)$response, true);
    if ($httpCode === 200 && is_array($responseData) && !empty($responseData['success'])) {
        ensureRoutePlannerColumns($conn);
        $conn->prepare("UPDATE route_plans SET whatsapp_status = 'Sent' WHERE route_id = ?")->execute([$routeId]);
        api_send_json(200, ['success' => true, 'message' => 'Route plan sent via WhatsApp successfully']);
    }

    $message = is_array($responseData) && !empty($responseData['message'])
        ? (string)$responseData['message']
        : 'Failed to send route on WhatsApp';
    api_send_json(400, ['success' => false, 'message' => $message]);
}

function ensureRoutePlannerColumns(PDO $conn): void
{
    $conn->exec("ALTER TABLE route_plans ADD COLUMN IF NOT EXISTS pdf_path VARCHAR(255)");
    $conn->exec("ALTER TABLE route_plans ADD COLUMN IF NOT EXISTS whatsapp_status VARCHAR(50) DEFAULT 'Pending'");
}

function enrichClientsWithPendingBills(PDO $conn, array &$clients): void
{
    if (empty($clients)) {
        return;
    }

    $clientIds = array_values(array_filter(array_map(static fn ($row) => (int)($row['client_id'] ?? 0), $clients)));
    if (empty($clientIds)) {
        return;
    }

    $placeholders = implode(',', array_fill(0, count($clientIds), '?'));
    $billStmt = $conn->prepare(
        "SELECT client_id, bill_number, bill_date, total_amount, paid_amount, (total_amount - COALESCE(paid_amount, 0)) AS pending_amount
         FROM bills
         WHERE client_id IN ($placeholders)
           AND (total_amount - COALESCE(paid_amount, 0)) > 0
           AND LOWER(payment_method) = 'credit'"
    );
    $billStmt->execute($clientIds);

    $billsByClient = [];
    while ($row = $billStmt->fetch(PDO::FETCH_ASSOC)) {
        $clientId = (int)$row['client_id'];
        if (!isset($billsByClient[$clientId])) {
            $billsByClient[$clientId] = [];
        }
        $billsByClient[$clientId][] = $row;
    }

    foreach ($clients as &$client) {
        $clientId = (int)($client['client_id'] ?? 0);
        $client['pending_bills_list'] = $billsByClient[$clientId] ?? [];
        $client['pending_bills_count'] = count($client['pending_bills_list']);
    }
}
?>

<?php
declare(strict_types=1);

require_once __DIR__ . '/../../config/db.php';
require_once __DIR__ . '/../lib/api_bootstrap.php';

api_bootstrap(['GET', 'POST']);

$currentUser = api_require_auth($conn, ['delivery', 'admin']);
$action = trim((string)($_GET['action'] ?? ''));

if ($action === '') {
    api_send_json(400, ['success' => false, 'error' => 'Action is required']);
}

try {
    $deliveryPersonId = resolveDeliveryPersonId($conn, (int)$currentUser['id']);
    if ($deliveryPersonId <= 0) {
        api_send_json(404, ['success' => false, 'error' => 'Delivery profile not found']);
    }

    switch ($action) {
        case 'list':
            listActiveDeliveries($conn, $deliveryPersonId);
            break;
        case 'history':
            listDeliveryHistory($conn, $deliveryPersonId);
            break;
        case 'update_status':
            updateDeliveryStatus($conn, $deliveryPersonId);
            break;
        case 'update_location':
            updateDeliveryLocation($conn, $deliveryPersonId);
            break;
        default:
            api_send_json(400, ['success' => false, 'error' => 'Invalid action']);
    }
} catch (Throwable $exception) {
    api_handle_exception($exception, 'Unable to process delivery request');
}

function resolveDeliveryPersonId(PDO $conn, int $userId): int
{
    $stmt = $conn->prepare("SELECT id FROM delivery_persons WHERE user_id = ?");
    $stmt->execute([$userId]);
    return (int)($stmt->fetchColumn() ?: 0);
}

function listActiveDeliveries(PDO $conn, int $deliveryPersonId): void
{
    $stmt = $conn->prepare(
        "SELECT
            o.id AS order_id, o.order_number, o.total_amount,
            c.name AS client_name, c.address AS client_address, c.phone AS client_mobile,
            d.id AS delivery_order_id, d.delivery_status, d.assigned_date, d.delivery_priority,
            (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) AS item_count
         FROM delivery_orders d
         JOIN orders o ON d.order_id = o.id
         JOIN clients c ON d.client_id = c.id
         WHERE d.delivery_person_id = ? AND d.delivery_status NOT IN ('Delivered', 'Failed Delivery')
         ORDER BY
            CASE d.delivery_priority
                WHEN 'Urgent' THEN 1
                WHEN 'High' THEN 2
                WHEN 'Normal' THEN 3
                ELSE 4
            END,
            d.assigned_date ASC"
    );
    $stmt->execute([$deliveryPersonId]);

    api_send_json(200, ['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
}

function listDeliveryHistory(PDO $conn, int $deliveryPersonId): void
{
    $stmt = $conn->prepare(
        "SELECT
            o.id AS order_id, o.order_number, o.total_amount,
            c.name AS client_name, c.address AS client_address,
            d.id AS delivery_order_id, d.delivery_status, d.assigned_date,
            dl.delivery_time, dl.remarks
         FROM delivery_orders d
         JOIN orders o ON d.order_id = o.id
         JOIN clients c ON d.client_id = c.id
         LEFT JOIN delivery_logs dl ON o.id = dl.order_id
            AND d.delivery_person_id = dl.delivery_person_id
            AND dl.delivery_status = d.delivery_status
         WHERE d.delivery_person_id = ? AND d.delivery_status IN ('Delivered', 'Failed Delivery')
         ORDER BY d.updated_at DESC
         LIMIT 50"
    );
    $stmt->execute([$deliveryPersonId]);

    api_send_json(200, ['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
}

function updateDeliveryStatus(PDO $conn, int $deliveryPersonId): void
{
    $data = api_get_json_input();
    $missing = api_require_fields($data, ['order_id', 'status']);
    if (!empty($missing)) {
        api_send_json(400, ['success' => false, 'error' => 'Missing required fields', 'fields' => $missing]);
    }

    $orderId = (int)$data['order_id'];
    $status = trim((string)$data['status']);
    $remarks = trim((string)($data['remarks'] ?? 'Updated via Delivery Panel'));

    $allowedStatuses = ['Assigned', 'Out for Delivery', 'Delivered', 'Failed Delivery', 'Returned'];
    if ($orderId <= 0 || !in_array($status, $allowedStatuses, true)) {
        api_send_json(400, ['success' => false, 'error' => 'Invalid order or status']);
    }

    $conn->beginTransaction();
    try {
        $update = $conn->prepare(
            "UPDATE delivery_orders
             SET delivery_status = ?, updated_at = NOW()
             WHERE order_id = ? AND delivery_person_id = ?"
        );
        $update->execute([$status, $orderId, $deliveryPersonId]);

        $insertLog = $conn->prepare(
            "INSERT INTO delivery_logs (order_id, delivery_person_id, delivery_status, remarks)
             VALUES (?, ?, ?, ?)"
        );
        $insertLog->execute([$orderId, $deliveryPersonId, $status, $remarks]);

        $conn->commit();
        api_send_json(200, ['success' => true, 'message' => 'Status updated successfully']);
    } catch (Throwable $exception) {
        if ($conn->inTransaction()) {
            $conn->rollBack();
        }
        throw $exception;
    }
}

function updateDeliveryLocation(PDO $conn, int $deliveryPersonId): void
{
    $data = api_get_json_input();
    $missing = api_require_fields($data, ['latitude', 'longitude']);
    if (!empty($missing)) {
        api_send_json(400, ['success' => false, 'error' => 'Missing location data', 'fields' => $missing]);
    }

    $latitude = (float)$data['latitude'];
    $longitude = (float)$data['longitude'];

    if ($latitude < -90 || $latitude > 90 || $longitude < -180 || $longitude > 180) {
        api_send_json(400, ['success' => false, 'error' => 'Invalid coordinates']);
    }

    $stmt = $conn->prepare("INSERT INTO delivery_tracking (delivery_person_id, latitude, longitude) VALUES (?, ?, ?)");
    $stmt->execute([$deliveryPersonId, $latitude, $longitude]);

    api_send_json(200, ['success' => true]);
}
?>

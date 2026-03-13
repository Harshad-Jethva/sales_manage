<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/lib/api_bootstrap.php';

api_bootstrap(['GET', 'POST']);

$currentUser = api_require_auth($conn, ['admin', 'cashier', 'salesman', 'warehouse', 'accountant', 'delivery']);
$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'POST') {
        handleCreate($conn, $currentUser);
    }

    handleRead($conn);
} catch (Throwable $exception) {
    api_handle_exception($exception, 'Unable to process cash handover');
}

function handleCreate(PDO $conn, array $currentUser): void
{
    $data = api_get_json_input();
    if (empty($data)) {
        api_send_json(400, ['success' => false, 'message' => 'Invalid input data']);
    }

    $counterName = trim((string)($data['counter_name'] ?? ''));
    if ($counterName === '') {
        api_send_json(400, ['success' => false, 'message' => 'Counter name is required']);
    }

    $handoverDate = trim((string)($data['handover_date'] ?? date('Y-m-d')));
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $handoverDate)) {
        api_send_json(400, ['success' => false, 'message' => 'Invalid handover date']);
    }

    $stmt = $conn->prepare(
        "INSERT INTO cash_handovers
         (user_id, counter_name, handover_date, total_cash, opening_balance, petty_cash, expected_balance, difference, denomination_data, payment_data, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );

    $stmt->execute([
        (int)$currentUser['id'],
        $counterName,
        $handoverDate,
        (float)($data['total_cash'] ?? 0),
        (float)($data['opening_balance'] ?? 0),
        (float)($data['petty_cash'] ?? 0),
        (float)($data['expected_balance'] ?? 0),
        (float)($data['difference'] ?? 0),
        json_encode($data['denomination_data'] ?? [], JSON_UNESCAPED_UNICODE),
        json_encode($data['payment_data'] ?? [], JSON_UNESCAPED_UNICODE),
        trim((string)($data['notes'] ?? '')),
    ]);

    api_send_json(201, ['success' => true, 'message' => 'Cash handover recorded successfully']);
}

function handleRead(PDO $conn): void
{
    $action = $_GET['action'] ?? 'history';

    if ($action === 'get_expected') {
        $date = $_GET['date'] ?? date('Y-m-d');
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            api_send_json(400, ['success' => false, 'message' => 'Invalid date']);
        }

        $stmt = $conn->prepare(
            "SELECT COALESCE(SUM(paid_amount), 0) AS expected_cash
             FROM bills
             WHERE bill_date = ? AND payment_method ILIKE '%cash%'"
        );
        $stmt->execute([$date]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        api_send_json(200, ['success' => true, 'expected_cash' => (float)($result['expected_cash'] ?? 0)]);
    }

    $query = "SELECT ch.*, u.name AS user_display_name
              FROM cash_handovers ch
              JOIN users u ON ch.user_id = u.id
              WHERE 1=1";
    $params = [];

    if (!empty($_GET['date_from'])) {
        $query .= " AND ch.handover_date >= ?";
        $params[] = $_GET['date_from'];
    }
    if (!empty($_GET['date_to'])) {
        $query .= " AND ch.handover_date <= ?";
        $params[] = $_GET['date_to'];
    }
    if (!empty($_GET['counter'])) {
        $query .= " AND ch.counter_name = ?";
        $params[] = $_GET['counter'];
    }
    if (!empty($_GET['user_id'])) {
        $query .= " AND ch.user_id = ?";
        $params[] = (int)$_GET['user_id'];
    }

    $query .= " ORDER BY ch.created_at DESC";
    $stmt = $conn->prepare($query);
    $stmt->execute($params);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rows as &$row) {
        $row['denomination_data'] = json_decode((string)$row['denomination_data'], true) ?: [];
        $row['payment_data'] = json_decode((string)$row['payment_data'], true) ?: [];
    }

    api_send_json(200, ['success' => true, 'data' => $rows]);
}
?>

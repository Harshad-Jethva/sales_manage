<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/lib/api_bootstrap.php';

api_bootstrap(['GET', 'POST', 'PUT', 'DELETE']);

$currentUser = api_require_auth($conn, ['admin', 'accountant', 'cashier']);
$method = $_SERVER['REQUEST_METHOD'];
$input = api_get_json_input();

try {
    switch ($method) {
        case 'GET':
            handleGet($conn);
            break;
        case 'POST':
            handlePost($conn, $input);
            break;
        case 'PUT':
            handlePut($conn, $input);
            break;
        case 'DELETE':
            handleDelete($conn, $input);
            break;
    }
} catch (Throwable $exception) {
    api_handle_exception($exception, 'Unable to process bank request');
}

function handleGet(PDO $conn): void
{
    $loadTransactions = isset($_GET['transactions']) || (isset($_GET['type']) && $_GET['type'] === 'transactions');

    if ($loadTransactions) {
        $sql = "SELECT t.*, a.bank_name, a.account_number
                FROM bank_transactions t
                JOIN bank_accounts a ON t.account_id = a.id";
        $params = [];

        if (isset($_GET['account_id']) && $_GET['account_id'] !== '') {
            $accountId = (int)$_GET['account_id'];
            if ($accountId <= 0) {
                api_send_json(400, ['success' => false, 'error' => 'Invalid account_id']);
            }
            $sql .= " WHERE t.account_id = ?";
            $params[] = $accountId;
        }

        $sql .= " ORDER BY t.transaction_date DESC";
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        api_send_json(200, ['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    $stmt = $conn->query("SELECT * FROM bank_accounts ORDER BY bank_name ASC");
    api_send_json(200, ['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
}

function handlePost(PDO $conn, array $input): void
{
    $action = $input['action'] ?? '';
    if ($action === '') {
        api_send_json(400, ['success' => false, 'error' => 'Action is required']);
    }

    if ($action === 'add_account') {
        $missing = api_require_fields($input, ['bank_name', 'account_number', 'account_holder']);
        if (!empty($missing)) {
            api_send_json(400, ['success' => false, 'error' => 'Missing required fields', 'fields' => $missing]);
        }

        $balance = isset($input['balance']) ? (float)$input['balance'] : 0.0;

        $stmt = $conn->prepare(
            "INSERT INTO bank_accounts (bank_name, account_number, account_holder, balance)
             VALUES (?, ?, ?, ?)"
        );
        $stmt->execute([
            trim((string)$input['bank_name']),
            trim((string)$input['account_number']),
            trim((string)$input['account_holder']),
            $balance,
        ]);

        api_send_json(201, ['success' => true, 'message' => 'Account added successfully']);
    }

    if ($action === 'transaction') {
        $missing = api_require_fields($input, ['account_id', 'type', 'amount', 'date']);
        if (!empty($missing)) {
            api_send_json(400, ['success' => false, 'error' => 'Missing required fields', 'fields' => $missing]);
        }

        $accountId = (int)$input['account_id'];
        $type = strtolower(trim((string)$input['type']));
        $amount = (float)$input['amount'];
        $description = isset($input['description']) ? trim((string)$input['description']) : null;
        $date = trim((string)$input['date']);

        if ($accountId <= 0 || $amount <= 0) {
            api_send_json(400, ['success' => false, 'error' => 'Invalid account or amount']);
        }
        if (!in_array($type, ['credit', 'debit'], true)) {
            api_send_json(400, ['success' => false, 'error' => 'Invalid transaction type']);
        }
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
            api_send_json(400, ['success' => false, 'error' => 'Invalid transaction date']);
        }

        $conn->beginTransaction();
        try {
            $balanceStmt = $conn->prepare("SELECT balance FROM bank_accounts WHERE id = ? FOR UPDATE");
            $balanceStmt->execute([$accountId]);
            $account = $balanceStmt->fetch(PDO::FETCH_ASSOC);

            if (!$account) {
                throw new RuntimeException('Bank account not found');
            }

            $currentBalance = (float)($account['balance'] ?? 0);
            $newBalance = $type === 'credit' ? $currentBalance + $amount : $currentBalance - $amount;

            if ($type === 'debit' && $newBalance < 0) {
                throw new RuntimeException('Insufficient balance for debit transaction');
            }

            $insertStmt = $conn->prepare(
                "INSERT INTO bank_transactions (account_id, type, amount, description, transaction_date)
                 VALUES (?, ?, ?, ?, ?)"
            );
            $insertStmt->execute([$accountId, $type, $amount, $description, $date]);

            $updateStmt = $conn->prepare("UPDATE bank_accounts SET balance = ? WHERE id = ?");
            $updateStmt->execute([$newBalance, $accountId]);

            $conn->commit();
            api_send_json(200, ['success' => true, 'message' => 'Transaction successful']);
        } catch (Throwable $exception) {
            if ($conn->inTransaction()) {
                $conn->rollBack();
            }
            throw $exception;
        }
    }

    api_send_json(400, ['success' => false, 'error' => 'Invalid action']);
}

function handlePut(PDO $conn, array $input): void
{
    $id = isset($input['id']) ? (int)$input['id'] : 0;
    if ($id <= 0) {
        api_send_json(400, ['success' => false, 'error' => 'ID required']);
    }

    $missing = api_require_fields($input, ['bank_name', 'account_number', 'account_holder']);
    if (!empty($missing)) {
        api_send_json(400, ['success' => false, 'error' => 'Missing required fields', 'fields' => $missing]);
    }

    $stmt = $conn->prepare(
        "UPDATE bank_accounts
         SET bank_name = ?, account_number = ?, account_holder = ?
         WHERE id = ?"
    );
    $stmt->execute([
        trim((string)$input['bank_name']),
        trim((string)$input['account_number']),
        trim((string)$input['account_holder']),
        $id,
    ]);

    api_send_json(200, ['success' => true, 'message' => 'Account updated']);
}

function handleDelete(PDO $conn, array $input): void
{
    $id = 0;
    if (isset($_GET['id'])) {
        $id = (int)$_GET['id'];
    } elseif (isset($input['id'])) {
        $id = (int)$input['id'];
    }

    if ($id <= 0) {
        api_send_json(400, ['success' => false, 'error' => 'ID required']);
    }

    $conn->beginTransaction();
    try {
        $deleteTransactions = $conn->prepare("DELETE FROM bank_transactions WHERE account_id = ?");
        $deleteTransactions->execute([$id]);

        $deleteAccount = $conn->prepare("DELETE FROM bank_accounts WHERE id = ?");
        $deleteAccount->execute([$id]);

        $conn->commit();
        api_send_json(200, ['success' => true, 'message' => 'Account deleted']);
    } catch (Throwable $exception) {
        if ($conn->inTransaction()) {
            $conn->rollBack();
        }
        throw $exception;
    }
}
?>

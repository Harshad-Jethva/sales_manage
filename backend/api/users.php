<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/lib/api_bootstrap.php';

api_bootstrap(['GET', 'POST', 'PUT', 'DELETE']);

$allowedRoles = [
    'admin',
    'cashier',
    'manager',
    'accountant',
    'salesman',
    'warehouse',
    'delivery',
    'client_panel',
    'vendor_user',
    'salesman_user',
    'custom_role',
];

$currentUser = api_require_auth($conn);
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGet($conn, $currentUser);
        break;
    case 'POST':
        requireAdmin($currentUser);
        handlePost($conn, $allowedRoles);
        break;
    case 'PUT':
        requireAdmin($currentUser);
        handlePut($conn, $allowedRoles);
        break;
    case 'DELETE':
        requireAdmin($currentUser);
        handleDelete($conn, $currentUser);
        break;
}

function requireAdmin(array $currentUser): void
{
    if (($currentUser['role'] ?? '') !== 'admin') {
        api_send_json(403, ['success' => false, 'message' => 'Only admin users can perform this action']);
    }
}

function handleGet(PDO $conn, array $currentUser): void
{
    $roleFilter = isset($_GET['role']) ? trim((string)$_GET['role']) : null;
    $idFilter = isset($_GET['id']) ? (int)$_GET['id'] : null;
    $isAdmin = ($currentUser['role'] ?? '') === 'admin';

    if ($idFilter) {
        if (!$isAdmin && (int)$currentUser['id'] !== $idFilter) {
            api_send_json(403, ['success' => false, 'message' => 'Forbidden']);
        }

        $stmt = $conn->prepare(
            "SELECT id, name, username, role, mobile_number, email, account_status, created_at, updated_at
             FROM users
             WHERE id = ?"
        );
        $stmt->execute([$idFilter]);
        api_send_json(200, ['success' => true, 'data' => $stmt->fetch(PDO::FETCH_ASSOC) ?: null]);
    }

    if ($roleFilter !== null && $roleFilter !== '') {
        $allowedReaderRoles = ['admin', 'warehouse'];
        if (!$isAdmin && !in_array($currentUser['role'] ?? '', $allowedReaderRoles, true)) {
            api_send_json(403, ['success' => false, 'message' => 'Forbidden']);
        }

        $stmt = $conn->prepare(
            "SELECT id, name, username, role, mobile_number, email, account_status, created_at, updated_at
             FROM users
             WHERE role = ?
             ORDER BY created_at DESC"
        );
        $stmt->execute([$roleFilter]);
        api_send_json(200, ['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    }

    if (!$isAdmin) {
        api_send_json(403, ['success' => false, 'message' => 'Forbidden']);
    }

    $stmt = $conn->query(
        "SELECT id, name, username, role, mobile_number, email, account_status, created_at, updated_at
         FROM users
         ORDER BY created_at DESC"
    );
    api_send_json(200, ['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
}

function handlePost(PDO $conn, array $allowedRoles): void
{
    $data = api_get_json_input();
    $missing = api_require_fields($data, ['name', 'username', 'password', 'role']);

    if (!empty($missing)) {
        api_send_json(400, ['success' => false, 'message' => 'Missing required fields', 'fields' => $missing]);
    }

    $name = trim((string)$data['name']);
    $username = trim((string)$data['username']);
    $password = (string)$data['password'];
    $role = trim((string)$data['role']);
    $mobile = isset($data['mobile_number']) ? trim((string)$data['mobile_number']) : null;
    $email = isset($data['email']) ? trim((string)$data['email']) : null;
    $status = isset($data['account_status']) ? strtolower(trim((string)$data['account_status'])) : 'active';

    if (!preg_match('/^[A-Za-z0-9_.-]{3,50}$/', $username)) {
        api_send_json(400, ['success' => false, 'message' => 'Invalid username format']);
    }

    if (strlen($password) < 6) {
        api_send_json(400, ['success' => false, 'message' => 'Password must be at least 6 characters']);
    }

    if (!in_array($role, $allowedRoles, true)) {
        api_send_json(400, ['success' => false, 'message' => 'Invalid role']);
    }

    if (!in_array($status, ['active', 'inactive'], true)) {
        api_send_json(400, ['success' => false, 'message' => 'Invalid account status']);
    }

    if ($email !== null && $email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        api_send_json(400, ['success' => false, 'message' => 'Invalid email format']);
    }

    try {
        $check = $conn->prepare("SELECT id FROM users WHERE username = ?");
        $check->execute([$username]);
        if ($check->fetch()) {
            api_send_json(409, ['success' => false, 'message' => 'Username already exists']);
        }

        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $conn->prepare(
            "INSERT INTO users (name, username, password, role, mobile_number, email, account_status, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)"
        );
        $stmt->execute([
            $name,
            $username,
            $hashedPassword,
            $role,
            $mobile ?: null,
            $email ?: null,
            $status,
        ]);

        api_send_json(201, ['success' => true, 'message' => 'User created successfully']);
    } catch (Throwable $exception) {
        api_handle_exception($exception, 'Unable to create user');
    }
}

function handlePut(PDO $conn, array $allowedRoles): void
{
    $data = api_get_json_input();
    $id = isset($data['id']) ? (int)$data['id'] : 0;

    if ($id <= 0) {
        api_send_json(400, ['success' => false, 'message' => 'Missing or invalid user ID']);
    }

    $fields = [];
    $params = [];

    if (array_key_exists('name', $data)) {
        $fields[] = "name = ?";
        $params[] = trim((string)$data['name']);
    }
    if (array_key_exists('role', $data)) {
        $role = trim((string)$data['role']);
        if (!in_array($role, $allowedRoles, true)) {
            api_send_json(400, ['success' => false, 'message' => 'Invalid role']);
        }
        $fields[] = "role = ?";
        $params[] = $role;
    }
    if (array_key_exists('mobile_number', $data)) {
        $fields[] = "mobile_number = ?";
        $params[] = trim((string)$data['mobile_number']) ?: null;
    }
    if (array_key_exists('email', $data)) {
        $email = trim((string)$data['email']);
        if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            api_send_json(400, ['success' => false, 'message' => 'Invalid email format']);
        }
        $fields[] = "email = ?";
        $params[] = $email ?: null;
    }
    if (array_key_exists('account_status', $data)) {
        $status = strtolower(trim((string)$data['account_status']));
        if (!in_array($status, ['active', 'inactive'], true)) {
            api_send_json(400, ['success' => false, 'message' => 'Invalid account status']);
        }
        $fields[] = "account_status = ?";
        $params[] = $status;
    }
    if (!empty($data['password'])) {
        $password = (string)$data['password'];
        if (strlen($password) < 6) {
            api_send_json(400, ['success' => false, 'message' => 'Password must be at least 6 characters']);
        }
        $fields[] = "password = ?";
        $params[] = password_hash($password, PASSWORD_DEFAULT);
    }

    if (empty($fields)) {
        api_send_json(200, ['success' => true, 'message' => 'No changes made']);
    }

    $fields[] = "updated_at = CURRENT_TIMESTAMP";
    $params[] = $id;

    try {
        $sql = "UPDATE users SET " . implode(", ", $fields) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);

        api_send_json(200, ['success' => true, 'message' => 'User updated successfully']);
    } catch (Throwable $exception) {
        api_handle_exception($exception, 'Unable to update user');
    }
}

function handleDelete(PDO $conn, array $currentUser): void
{
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($id <= 0) {
        $data = api_get_json_input();
        $id = isset($data['id']) ? (int)$data['id'] : 0;
    }

    if ($id <= 0) {
        api_send_json(400, ['success' => false, 'message' => 'Missing or invalid user ID']);
    }

    if ((int)$currentUser['id'] === $id) {
        api_send_json(400, ['success' => false, 'message' => 'You cannot delete your own account']);
    }

    try {
        $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);
        api_send_json(200, ['success' => true, 'message' => 'User deleted successfully']);
    } catch (Throwable $exception) {
        api_handle_exception($exception, 'Unable to delete user');
    }
}
?>

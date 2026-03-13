<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/lib/api_bootstrap.php';

api_bootstrap(['POST']);

$input = api_get_json_input();
$username = trim((string)($input['username'] ?? ''));
$password = (string)($input['password'] ?? '');

if ($username === '' || $password === '') {
    api_send_json(400, ['success' => false, 'message' => 'Username and password are required']);
}

try {
    $stmt = $conn->prepare(
        "SELECT id, name, username, role, password, account_status, mobile_number, email, created_at, updated_at
         FROM users
         WHERE username = ?
         LIMIT 1"
    );
    $stmt->execute([$username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($password, (string)$user['password'])) {
        api_send_json(401, ['success' => false, 'message' => 'Invalid username or password']);
    }

    if (isset($user['account_status']) && strtolower((string)$user['account_status']) !== 'active') {
        api_send_json(403, ['success' => false, 'message' => 'Your account is inactive. Contact administrator.']);
    }

    $token = bin2hex(random_bytes(32));
    $tokenStmt = $conn->prepare("UPDATE users SET session_token = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
    $tokenStmt->execute([$token, $user['id']]);

    unset($user['password']);

    api_send_json(
        200,
        [
            'success' => true,
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ]
    );
} catch (Throwable $exception) {
    api_handle_exception($exception, 'Unable to process login');
}
?>

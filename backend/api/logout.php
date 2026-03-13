<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/lib/api_bootstrap.php';

api_bootstrap(['POST']);

$input = api_get_json_input();
$token = null;

if (!empty($input['token']) && is_string($input['token'])) {
    $token = trim($input['token']);
}

if (!$token) {
    $token = api_get_bearer_token();
}

if (!$token) {
    api_send_json(400, ['success' => false, 'message' => 'Token not provided']);
}

try {
    $stmt = $conn->prepare("UPDATE users SET session_token = NULL WHERE session_token = ?");
    $stmt->execute([$token]);

    api_send_json(200, ['success' => true, 'message' => 'Logged out successfully']);
} catch (Throwable $exception) {
    api_handle_exception($exception, 'Unable to complete logout');
}
?>

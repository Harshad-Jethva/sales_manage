<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/lib/api_bootstrap.php';

api_bootstrap(['GET', 'POST']);

$input = $_SERVER['REQUEST_METHOD'] === 'POST' ? api_get_json_input() : [];
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
    $user = api_get_authenticated_user($conn, $token);
    if (!$user) {
        api_send_json(401, ['success' => false, 'message' => 'Invalid token']);
    }

    api_send_json(200, ['success' => true, 'message' => 'Token is valid', 'user' => $user]);
} catch (Throwable $exception) {
    api_handle_exception($exception, 'Unable to verify authentication');
}
?>

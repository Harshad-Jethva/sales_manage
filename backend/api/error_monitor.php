<?php
declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/lib/api_bootstrap.php';

api_bootstrap(['POST']);

$payload = api_get_json_input();
$message = trim((string)($payload['message'] ?? ''));
$type = trim((string)($payload['type'] ?? 'unknown'));

if ($message === '') {
    api_send_json(400, ['success' => false, 'message' => 'Message is required']);
}

$user = api_get_authenticated_user($conn);
$logDir = dirname(__DIR__) . '/logs';
if (!is_dir($logDir)) {
    @mkdir($logDir, 0775, true);
}

$entry = [
    'timestamp' => gmdate('c'),
    'type' => substr($type, 0, 100),
    'message' => substr($message, 0, 2000),
    'url' => substr((string)($payload['url'] ?? ''), 0, 1000),
    'method' => substr((string)($payload['method'] ?? ''), 0, 50),
    'status' => isset($payload['status']) ? (int)$payload['status'] : null,
    'stack' => substr((string)($payload['stack'] ?? ''), 0, 8000),
    'source' => substr((string)($payload['source'] ?? ''), 0, 500),
    'line' => isset($payload['line']) ? (int)$payload['line'] : null,
    'column' => isset($payload['column']) ? (int)$payload['column'] : null,
    'href' => substr((string)($payload['href'] ?? ''), 0, 1000),
    'client_time' => substr((string)($payload['timestamp'] ?? ''), 0, 50),
    'ip' => $_SERVER['REMOTE_ADDR'] ?? null,
    'user_id' => $user['id'] ?? null,
    'username' => $user['username'] ?? null,
    'role' => $user['role'] ?? null,
];

@file_put_contents(
    $logDir . '/client_errors.log',
    json_encode($entry, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL,
    FILE_APPEND
);

api_send_json(200, ['success' => true]);
?>

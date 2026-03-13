<?php
declare(strict_types=1);

if (!function_exists('api_bootstrap')) {
    function api_bootstrap(array $allowedMethods = [], bool $allowPreflight = true): void
    {
        if (php_sapi_name() !== 'cli') {
            header("Access-Control-Allow-Origin: *");
            header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
            header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
            header("Content-Type: application/json; charset=UTF-8");
        }

        ini_set('display_errors', '0');
        ini_set('display_startup_errors', '0');
        error_reporting(E_ALL);

        set_error_handler(
            static function (int $severity, string $message, string $file, int $line): bool {
                if (!(error_reporting() & $severity)) {
                    return false;
                }

                throw new ErrorException($message, 0, $severity, $file, $line);
            }
        );

        set_exception_handler(
            static function (Throwable $exception): void {
                api_log_error(
                    'Uncaught API exception',
                    [
                        'type' => get_class($exception),
                        'message' => $exception->getMessage(),
                        'file' => $exception->getFile(),
                        'line' => $exception->getLine(),
                        'trace' => $exception->getTraceAsString(),
                    ]
                );

                api_send_json(500, ['success' => false, 'message' => 'Internal server error']);
            }
        );

        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        if ($allowPreflight && $method === 'OPTIONS') {
            http_response_code(200);
            exit;
        }

        if (!empty($allowedMethods) && !in_array($method, $allowedMethods, true)) {
            api_send_json(405, ['success' => false, 'message' => 'Method not allowed']);
        }
    }
}

if (!function_exists('api_send_json')) {
    function api_send_json(int $statusCode, array $payload): void
    {
        http_response_code($statusCode);
        $encoded = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        echo $encoded !== false ? $encoded : '{"success":false,"message":"Response encoding failure"}';
        exit;
    }
}

if (!function_exists('api_log_error')) {
    function api_log_error(string $message, array $context = []): void
    {
        $logDir = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'logs';
        if (!is_dir($logDir)) {
            @mkdir($logDir, 0775, true);
        }

        $entry = [
            'timestamp' => gmdate('c'),
            'endpoint' => $_SERVER['SCRIPT_NAME'] ?? 'unknown',
            'request_uri' => $_SERVER['REQUEST_URI'] ?? null,
            'method' => $_SERVER['REQUEST_METHOD'] ?? null,
            'ip' => $_SERVER['REMOTE_ADDR'] ?? null,
            'message' => $message,
            'context' => $context,
        ];

        @file_put_contents(
            $logDir . DIRECTORY_SEPARATOR . 'api_errors.log',
            json_encode($entry, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL,
            FILE_APPEND
        );
    }
}

if (!function_exists('api_get_json_input')) {
    function api_get_json_input(): array
    {
        $rawInput = file_get_contents('php://input');
        if ($rawInput === false || trim($rawInput) === '') {
            return [];
        }

        $decoded = json_decode($rawInput, true);
        return is_array($decoded) ? $decoded : [];
    }
}

if (!function_exists('api_get_bearer_token')) {
    function api_get_bearer_token(): ?string
    {
        $tokenHeader = null;

        if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
            $tokenHeader = $_SERVER['HTTP_AUTHORIZATION'];
        } elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $tokenHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
        } elseif (function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            if (!empty($headers['Authorization'])) {
                $tokenHeader = $headers['Authorization'];
            }
        }

        if ($tokenHeader && preg_match('/Bearer\s+(\S+)/i', trim($tokenHeader), $matches)) {
            return $matches[1];
        }

        return null;
    }
}

if (!function_exists('api_get_authenticated_user')) {
    function api_get_authenticated_user(PDO $conn, ?string $tokenOverride = null): ?array
    {
        $token = $tokenOverride ?: api_get_bearer_token();
        if (!$token) {
            return null;
        }

        $stmt = $conn->prepare(
            "SELECT id, name, username, role, account_status, mobile_number, email, created_at, updated_at
             FROM users
             WHERE session_token = ?
             LIMIT 1"
        );
        $stmt->execute([$token]);

        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        return $user ?: null;
    }
}

if (!function_exists('api_require_auth')) {
    function api_require_auth(PDO $conn, array $allowedRoles = []): array
    {
        $user = api_get_authenticated_user($conn);
        if (!$user) {
            api_send_json(401, ['success' => false, 'message' => 'Unauthorized']);
        }

        if (!empty($allowedRoles) && !in_array($user['role'] ?? '', $allowedRoles, true)) {
            api_send_json(403, ['success' => false, 'message' => 'Forbidden']);
        }

        return $user;
    }
}

if (!function_exists('api_require_fields')) {
    function api_require_fields(array $input, array $required): array
    {
        $missing = [];
        foreach ($required as $field) {
            if (!array_key_exists($field, $input) || trim((string)$input[$field]) === '') {
                $missing[] = $field;
            }
        }
        return $missing;
    }
}

if (!function_exists('api_handle_exception')) {
    function api_handle_exception(Throwable $exception, string $publicMessage = 'Internal server error', int $statusCode = 500, array $context = []): void
    {
        api_log_error(
            $publicMessage,
            array_merge(
                $context,
                [
                    'error' => $exception->getMessage(),
                    'file' => $exception->getFile(),
                    'line' => $exception->getLine(),
                ]
            )
        );

        api_send_json($statusCode, ['success' => false, 'message' => $publicMessage]);
    }
}

<?php
declare(strict_types=1);

if (php_sapi_name() !== 'cli') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Content-Type: application/json; charset=UTF-8");

    if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');
error_reporting(E_ALL);

$host = getenv('DB_HOST') ?: "localhost";
$port = getenv('DB_PORT') ?: "5432";
$db_name = getenv('DB_NAME') ?: "sales_manage";
$username = getenv('DB_USER') ?: "postgres";
$password = getenv('DB_PASS') ?: "Harshad@2005"; // Override via environment in production.

try {
    $dsn = "pgsql:host=$host;port=$port;dbname=$db_name";
    $conn = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $exception) {
    $message = sprintf(
        "[%s] DB connection failed in %s: %s\n",
        gmdate('c'),
        $_SERVER['SCRIPT_NAME'] ?? 'cli',
        $exception->getMessage()
    );
    @error_log($message, 3, dirname(__DIR__) . '/logs/db_errors.log');

    if (php_sapi_name() !== 'cli') {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Database connection failed"]);
    }
    exit();
}
?>

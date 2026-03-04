<?php
require_once '../../config/db.php';

try {
    // Total Stock (assuming products table has stock_quantity)
    $stmt = $conn->query("SELECT SUM(stock_quantity) FROM products");
    $total_stock = $stmt->fetchColumn() ?: 0;

    // Low Stock Items (threshold e.g. 50)
    $stmt = $conn->query("SELECT COUNT(*) FROM products WHERE stock_quantity < 50");
    $low_stock = $stmt->fetchColumn();

    // Pending Orders
    $stmt = $conn->query("SELECT COUNT(*) FROM orders WHERE status = 'Pending'");
    $pending_orders = $stmt->fetchColumn();

    // Fulfilled Today
    $stmt = $conn->query("SELECT COUNT(*) FROM orders WHERE status = 'Completed' AND updated_at::date = CURRENT_DATE");
    $fulfilled_today = $stmt->fetchColumn();

    echo json_encode([
        "success" => true,
        "data" => [
            "totalStock" => $total_stock,
            "lowStockItems" => $low_stock,
            "pendingOrders" => $pending_orders,
            "fulfilledToday" => $fulfilled_today
        ]
    ]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>

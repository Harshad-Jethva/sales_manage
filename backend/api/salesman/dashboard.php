<?php
require_once '../../config/db.php';

$salesman_id = isset($_GET['salesman_id']) ? $_GET['salesman_id'] : null;

if (!$salesman_id) {
    echo json_encode(["success" => false, "message" => "Salesman ID is required"]);
    exit();
}

try {
    // Total Orders
    $stmt = $conn->prepare("SELECT COUNT(*) FROM orders WHERE salesman_id = ?");
    $stmt->execute([$salesman_id]);
    $total_orders = $stmt->fetchColumn();

    // Today's Orders
    $stmt = $conn->prepare("SELECT COUNT(*) FROM orders WHERE salesman_id = ? AND order_date = CURRENT_DATE");
    $stmt->execute([$salesman_id]);
    $today_orders = $stmt->fetchColumn();

    // Total Clients
    // Assuming we want to count clients who have placed orders with this salesman
    $stmt = $conn->prepare("SELECT COUNT(DISTINCT client_id) FROM orders WHERE salesman_id = ?");
    $stmt->execute([$salesman_id]);
    $total_clients = $stmt->fetchColumn();

    // Sales Summary (Total Amount)
    $stmt = $conn->prepare("SELECT SUM(total_amount) FROM orders WHERE salesman_id = ?");
    $stmt->execute([$salesman_id]);
    $total_sales = $stmt->fetchColumn() ?: 0;

    // Monthly Sales for chart/summary
    $stmt = $conn->prepare("SELECT TO_CHAR(order_date, 'YYYY-MM') as month, SUM(total_amount) as amount 
                            FROM orders 
                            WHERE salesman_id = ? 
                            GROUP BY month 
                            ORDER BY month DESC 
                            LIMIT 6");
    $stmt->execute([$salesman_id]);
    $monthly_sales = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "data" => [
            "total_orders" => $total_orders,
            "today_orders" => $today_orders,
            "total_clients" => $total_clients,
            "total_sales" => $total_sales,
            "monthly_sales" => $monthly_sales
        ]
    ]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>

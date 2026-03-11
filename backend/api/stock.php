<?php
require_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get stock details or history
        if (isset($_GET['action'])) {
            if ($_GET['action'] === 'history') {
                $productId = $_GET['product_id'] ?? null;
                if ($productId) {
                    $stmt = $conn->prepare("SELECT * FROM stock_history WHERE product_id = ? ORDER BY created_at DESC");
                    $stmt->execute([$productId]);
                } else {
                    $stmt = $conn->query("SELECT sh.*, p.name as product_name FROM stock_history sh JOIN products p ON sh.product_id = p.id ORDER BY sh.created_at DESC LIMIT 100");
                }
                echo json_encode(["success" => true, "data" => $stmt->fetchAll()]);
            } elseif ($_GET['action'] === 'alerts') {
                // Get low stock and out of stock items
                $stmt = $conn->query("SELECT id, name, stock_quantity, min_stock_level FROM products WHERE stock_quantity <= min_stock_level ORDER BY stock_quantity ASC");
                echo json_encode(["success" => true, "data" => $stmt->fetchAll()]);
            }
        } else {
            // General stock listing with details
            $stmt = $conn->query("SELECT p.*, s.supplier_name FROM products p LEFT JOIN suppliers s ON p.supplier_id = s.id ORDER BY p.name ASC");
            echo json_encode(["success" => true, "data" => $stmt->fetchAll()]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $action = $data['action'] ?? '';

        if ($action === 'update') {
            $productId = $data['product_id'];
            $change = $data['change']; // can be positive or negative
            $type = $data['type']; // 'purchase', 'sale', 'adjustment', 'return'
            $referenceId = $data['reference_id'] ?? null;
            $notes = $data['notes'] ?? '';

            try {
                $conn->beginTransaction();

                // Get current stock
                $stmt = $conn->prepare("SELECT name, stock_quantity FROM products WHERE id = ? FOR UPDATE");
                $stmt->execute([$productId]);
                $product = $stmt->fetch();
                $product_name = $product['name'] ?? 'Unknown Item';

                if (!$product) {
                    throw new Exception("Product not found");
                }

                $oldQuantity = (float)$product['stock_quantity'];
                $newQuantity = $oldQuantity + (float)$change;

                if ($newQuantity < 0) {
                    throw new Exception("Insufficient stock. Available: $oldQuantity");
                }

                // Update stock
                $updateStmt = $conn->prepare("UPDATE products SET stock_quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
                $updateStmt->execute([$newQuantity, $productId]);

                // Log history
                $logStmt = $conn->prepare("INSERT INTO stock_history (product_id, change_quantity, old_quantity, new_quantity, type, reference_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?)");
                $logStmt->execute([$productId, $change, $oldQuantity, $newQuantity, $type, $referenceId, $notes]);

                // Phase 5 & 6: Trigger notifications if low/out of stock
                if ($newQuantity <= 3) {
                    $msg = $newQuantity == 0 ? "Stock Out Alert: Item '$product_name' is out of stock." : "Low Stock Alert: Item '$product_name' only has $newQuantity units remaining.";
                    $notifType = $newQuantity == 0 ? 'critical' : 'warning';
                    
                    // Use RETURNING id for PostgreSQL, or LAST_INSERT_ID() for MySQL
                    // Assuming PostgreSQL for RETURNING id
                    $notifStmt = $conn->prepare("INSERT INTO notifications (title, message, type, source) VALUES (?, ?, ?, 'system') RETURNING id");
                    $notifStmt->execute([$newQuantity == 0 ? "Stock Out Alert" : "Low Stock Alert", $msg, $notifType]);
                    $notif_id = $notifStmt->fetchColumn();

                    if ($notif_id) {
                        // Notify all admins
                        $conn->exec("INSERT INTO notification_recipients (notification_id, user_id) 
                                    SELECT $notif_id, id FROM users WHERE role = 'admin'");
                    }
                }

                $conn->commit();
                echo json_encode(["success" => true, "message" => "Stock updated successfully", "new_quantity" => $newQuantity]);
            } catch (Exception $e) {
                $conn->rollBack();
                echo json_encode(["success" => false, "error" => $e->getMessage()]);
            }
        }
        break;
}

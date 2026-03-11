<?php
require_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $action = $_GET['action'] ?? 'list';

        if ($action === 'list') {
            // Get expiry inventory list
            $query = "SELECT p.id, p.name as item_name, s.supplier_name, p.mfg_date, p.expiry_date, 
                             p.stock_quantity, p.default_fetch_quantity,
                             (p.expiry_date - CURRENT_DATE) as remaining_days
                      FROM products p
                      LEFT JOIN suppliers s ON p.supplier_id = s.id
                      WHERE p.expiry_date IS NOT NULL
                      ORDER BY p.expiry_date ASC";
            
            $stmt = $conn->query($query);
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $items]);
        } 
        elseif ($action === 'check_alerts') {
            // Check for new expiry alerts and generate notifications
            try {
                $conn->beginTransaction();

                // 1. Check for expired items
                $expired_query = "SELECT id, name FROM products WHERE expiry_date <= CURRENT_DATE AND expiry_date > CURRENT_DATE - INTERVAL '1 day'";
                $expired_stmt = $conn->query($expired_query);
                $expired_items = $expired_stmt->fetchAll();

                foreach ($expired_items as $item) {
                    generateNotification($conn, "Item Expired", "Product '{$item['name']}' has expired.", 'critical');
                }

                // 2. Check for items expiring in 7 days
                $exp7_query = "SELECT id, name FROM products WHERE expiry_date = CURRENT_DATE + INTERVAL '7 days'";
                $exp7_stmt = $conn->query($exp7_query);
                $exp7_items = $exp7_stmt->fetchAll();

                foreach ($exp7_items as $item) {
                    generateNotification($conn, "Expiry Alert (7 Days)", "Product '{$item['name']}' will expire in 7 days.", 'warning');
                }

                // 3. Check for items expiring in 30 days
                $exp30_query = "SELECT id, name FROM products WHERE expiry_date = CURRENT_DATE + INTERVAL '30 days'";
                $exp30_stmt = $conn->query($exp30_query);
                $exp30_items = $exp30_stmt->fetchAll();

                foreach ($exp30_items as $item) {
                    generateNotification($conn, "Expiry Alert (30 Days)", "Product '{$item['name']}' will expire in 30 days.", 'info');
                }

                $conn->commit();
                echo json_encode(["success" => true, "message" => "Alerts checked and generated"]);
            } catch (Exception $e) {
                $conn->rollBack();
                echo json_encode(["success" => false, "error" => $e->getMessage()]);
            }
        }
        elseif ($action === 'reports') {
            $report_type = $_GET['type'] ?? 'soon'; // soon, expired, supplier
            
            $query = "";
            if ($report_type === 'expired') {
                $query = "SELECT p.*, s.supplier_name FROM products p LEFT JOIN suppliers s ON p.supplier_id = s.id WHERE p.expiry_date <= CURRENT_DATE";
            } elseif ($report_type === 'supplier') {
                $query = "SELECT p.*, s.supplier_name FROM products p JOIN suppliers s ON p.supplier_id = s.id WHERE p.expiry_date <= CURRENT_DATE + INTERVAL '30 days' ORDER BY s.supplier_name";
            } else {
                // soon
                $days = (int)($_GET['days'] ?? 30);
                $query = "SELECT p.*, s.supplier_name FROM products p LEFT JOIN suppliers s ON p.supplier_id = s.id WHERE p.expiry_date > CURRENT_DATE AND p.expiry_date <= CURRENT_DATE + INTERVAL '$days days'";
            }

            $stmt = $conn->query($query);
            echo json_encode(["success" => true, "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
        }
        break;
}

function generateNotification($conn, $title, $message, $type) {
    // Check if same notification was sent today to avoid spamming
    $check = $conn->prepare("SELECT id FROM notifications WHERE title = ? AND message = ? AND created_at >= CURRENT_DATE");
    $check->execute([$title, $message]);
    if ($check->fetch()) return;

    // The notifications table doesn't have 'type' or 'source' columns in schema
    // We'll prepend the type to the title for visual clarity
    $typedTitle = "[" . strtoupper($type) . "] " . $title;

    $notifStmt = $conn->prepare("INSERT INTO notifications (title, message, sender_id) VALUES (?, ?, ?) RETURNING id");
    $notifStmt->execute([$typedTitle, $message, 1]); // 1 is usually System Admin
    $notif_id = $notifStmt->fetchColumn();

    if ($notif_id) {
        $conn->exec("INSERT INTO notification_recipients (notification_id, user_id) 
                    SELECT $notif_id, id FROM users WHERE role = 'admin'");
    }
}
?>

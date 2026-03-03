<?php
require_once '../../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGet($conn);
        break;
    case 'POST':
        handlePost($conn);
        break;
    case 'PUT':
        handlePut($conn);
        break;
    case 'DELETE':
        handleDelete($conn);
        break;
    default:
        echo json_encode(["success" => false, "message" => "Method not allowed"]);
        break;
}

function handleGet($conn) {
    $salesman_id = isset($_GET['salesman_id']) ? $_GET['salesman_id'] : null;
    $order_id = isset($_GET['order_id']) ? $_GET['order_id'] : null;
    $client_id = isset($_GET['client_id']) ? $_GET['client_id'] : null;

    try {
        if ($order_id) {
            // Get single order with items
            $stmt = $conn->prepare("SELECT o.*, c.name as client_name, u.name as salesman_name 
                                    FROM orders o 
                                    JOIN clients c ON o.client_id = c.id 
                                    JOIN users u ON o.salesman_id = u.id 
                                    WHERE o.id = ?");
            $stmt->execute([$order_id]);
            $order = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($order) {
                $stmt = $conn->prepare("SELECT * FROM order_items WHERE order_id = ?");
                $stmt->execute([$order_id]);
                $order['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(["success" => true, "data" => $order]);
            } else {
                echo json_encode(["success" => false, "message" => "Order not found"]);
            }
        } else {
            // Get list of orders
            $query = "SELECT o.*, c.name as client_name 
                      FROM orders o 
                      JOIN clients c ON o.client_id = c.id 
                      WHERE 1=1";
            $params = [];

            if ($salesman_id) {
                $query .= " AND o.salesman_id = ?";
                $params[] = $salesman_id;
            }

            if ($client_id) {
                $query .= " AND o.client_id = ?";
                $params[] = $client_id;
            }

            if (isset($_GET['search']) && !empty($_GET['search'])) {
                $search = "%" . trim($_GET['search']) . "%";
                $query .= " AND (c.name LIKE ? OR c.company LIKE ?)";
                $params[] = $search;
                $params[] = $search;
            }

            if (isset($_GET['status']) && !empty($_GET['status'])) {
                $query .= " AND o.status = ?";
                $params[] = $_GET['status'];
            }

            if (isset($_GET['start_date']) && !empty($_GET['start_date'])) {
                $query .= " AND o.order_date >= ?";
                $params[] = $_GET['start_date'];
            }

            if (isset($_GET['end_date']) && !empty($_GET['end_date'])) {
                $query .= " AND o.order_date <= ?";
                $params[] = $_GET['end_date'];
            }

            $query .= " ORDER BY o.created_at DESC";

            // Pagination
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
            $offset = ($page - 1) * $limit;
            $query .= " LIMIT $limit OFFSET $offset";

            $stmt = $conn->prepare($query);
            $stmt->execute($params);
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode(["success" => true, "data" => $orders]);
        }
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}

function handlePost($conn) {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data) {
        echo json_encode(["success" => false, "message" => "Invalid input"]);
        exit();
    }

    try {
        $conn->beginTransaction();

        // 1. Generate Order ID
        $order_number = 'ORD-' . strtoupper(bin2hex(random_bytes(3)));
        
        // 2. Insert into orders
        $stmt = $conn->prepare("INSERT INTO orders (order_number, salesman_id, client_id, sub_total, discount_amount, tax_amount, total_amount, status, order_date, notes) 
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_DATE, ?)");
        $stmt->execute([
            $order_number,
            $data['salesman_id'],
            $data['client_id'],
            $data['sub_total'],
            $data['discount_amount'],
            $data['tax_amount'],
            $data['total_amount'],
            $data['status'] ?? 'Pending',
            $data['notes'] ?? ''
        ]);

        $order_id = $conn->lastInsertId();

        // 3. Insert items and validate stock
        foreach ($data['items'] as $item) {
            // Check stock
            $stmt = $conn->prepare("SELECT stock_quantity, name FROM products WHERE id = ?");
            $stmt->execute([$item['product_id']]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$product || $product['stock_quantity'] < $item['quantity']) {
                throw new Exception("Insufficient stock for product: " . ($product ? $product['name'] : "Unknown"));
            }

            // Update stock
            $stmt = $conn->prepare("UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?");
            $stmt->execute([$item['quantity'], $item['product_id']]);

            // Insert item
            $stmt = $conn->prepare("INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, discount_percent, gst_percent, tax_amount, total_amount) 
                                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $order_id,
                $item['product_id'],
                $item['product_name'],
                $item['quantity'],
                $item['unit_price'],
                $item['discount_percent'] ?? 0,
                $item['gst_percent'] ?? 0,
                $item['tax_amount'] ?? 0,
                $item['total_amount']
            ]);
        }

        $conn->commit();

        // Trigger PDF Generation
        $automation_url = 'http://localhost:5000/generate-pdf';
        $ch = curl_init($automation_url);
        $payload = json_encode(['order_id' => $order_id]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 2); // Short timeout so it doesn't block the user
        $result = curl_exec($ch);
        curl_close($ch);

        echo json_encode(["success" => true, "message" => "Order placed successfully", "order_id" => $order_id, "order_number" => $order_number]);

    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}

function handlePut($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (!$data) {
        echo json_encode(["success" => false, "message" => "Invalid input"]);
        return;
    }

    try {
        $conn->beginTransaction();

        if (isset($data['item_id'])) {
            $item_id = $data['item_id'];
            $new_quantity = $data['quantity'];

            // Get old item
            $stmt = $conn->prepare("SELECT order_id, product_id, quantity, unit_price, discount_percent, gst_percent FROM order_items WHERE id = ?");
            $stmt->execute([$item_id]);
            $item = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$item) throw new Exception("Item not found");

            // Check stock diff
            $qty_diff = $new_quantity - $item['quantity'];
            if ($qty_diff > 0) {
                $stmt = $conn->prepare("SELECT stock_quantity FROM products WHERE id = ?");
                $stmt->execute([$item['product_id']]);
                $product = $stmt->fetch(PDO::FETCH_ASSOC);

                if (!$product || $product['stock_quantity'] < $qty_diff) {
                    throw new Exception("Insufficient stock");
                }
            }

            // Update stock
            if ($qty_diff != 0) {
                $stmt = $conn->prepare("UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?");
                $stmt->execute([$qty_diff, $item['product_id']]);
            }

            // Recalculate item totals
            $amount = $item['unit_price'] * $new_quantity;
            $item_disc = $amount * ($item['discount_percent'] / 100);
            $after_disc = $amount - $item_disc;
            $item_tax = $after_disc * ($item['gst_percent'] / 100);
            $item_total = $after_disc + $item_tax;

            // Update item
            $stmt = $conn->prepare("UPDATE order_items SET quantity = ?, tax_amount = ?, total_amount = ? WHERE id = ?");
            $stmt->execute([$new_quantity, $item_tax, $item_total, $item_id]);

            // Recalculate order totals
            recalculateOrderTotals($conn, $item['order_id']);

            $message = "Item updated successfully";

        } else if (isset($data['order_id'])) {
            $order_id = $data['order_id'];
            
            if (isset($data['status'])) {
                $stmt = $conn->prepare("UPDATE orders SET status = ?, notes = ? WHERE id = ?");
                $stmt->execute([$data['status'], $data['notes'] ?? '', $order_id]);
                $message = "Order details updated successfully";
            }
        }

        $conn->commit();
        echo json_encode(["success" => true, "message" => $message ?? "Updated successfully"]);
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}

function handleDelete($conn) {
    if (!isset($_GET['order_id']) && !isset($_GET['item_id'])) {
        echo json_encode(["success" => false, "message" => "Order ID or Item ID required"]);
        return;
    }

    try {
        $conn->beginTransaction();

        if (isset($_GET['item_id'])) {
            $item_id = $_GET['item_id'];
            
            // Get item details
            $stmt = $conn->prepare("SELECT order_id, product_id, quantity, total_amount, tax_amount FROM order_items WHERE id = ?");
            $stmt->execute([$item_id]);
            $item = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($item) {
                // Restore stock
                $stmt = $conn->prepare("UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?");
                $stmt->execute([$item['quantity'], $item['product_id']]);

                // Delete item
                $stmt = $conn->prepare("DELETE FROM order_items WHERE id = ?");
                $stmt->execute([$item_id]);

                // Update order totals
                recalculateOrderTotals($conn, $item['order_id']);
                
                $message = "Item deleted successfully";
            } else {
                throw new Exception("Item not found");
            }
        } else if (isset($_GET['order_id'])) {
            $order_id = $_GET['order_id'];

            // Get items to restore stock
            $stmt = $conn->prepare("SELECT product_id, quantity FROM order_items WHERE order_id = ?");
            $stmt->execute([$order_id]);
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($items as $item) {
                $stmt = $conn->prepare("UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?");
                $stmt->execute([$item['quantity'], $item['product_id']]);
            }

            // Delete order_pdfs (if any) to prevent foreign key errors and clean up file
            try {
                $stmt = $conn->prepare("SELECT pdf_path FROM order_pdfs WHERE order_id = ?");
                $stmt->execute([$order_id]);
                $pdf_record = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($pdf_record && !empty($pdf_record['pdf_path'])) {
                    // pdf_path is stored as '/uploads/invoices/...'
                    // Needs to be resolved to absolute path
                    $file_to_delete = dirname(dirname(__DIR__)) . $pdf_record['pdf_path'];
                    if (file_exists($file_to_delete)) {
                        unlink($file_to_delete);
                    }
                }

                $stmt = $conn->prepare("DELETE FROM order_pdfs WHERE order_id = ?");
                $stmt->execute([$order_id]);
            } catch (Exception $e) {
                // Ignore if table doesn't exist
            }

            // Delete order items
            $stmt = $conn->prepare("DELETE FROM order_items WHERE order_id = ?");
            $stmt->execute([$order_id]);

            // Delete order
            $stmt = $conn->prepare("DELETE FROM orders WHERE id = ?");
            $stmt->execute([$order_id]);

            $message = "Order deleted successfully";
        }

        $conn->commit();
        echo json_encode(["success" => true, "message" => $message]);
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}

function recalculateOrderTotals($conn, $order_id) {
    $stmt = $conn->prepare("SELECT * FROM order_items WHERE order_id = ?");
    $stmt->execute([$order_id]);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $sub_total = 0;
    $tax_amount = 0;
    $discount_amount = 0;
    $total_amount = 0;

    foreach ($items as $item) {
        $amount = $item['unit_price'] * $item['quantity'];
        $item_disc = $amount * ($item['discount_percent'] / 100);
        $sub_total += $amount;
        $discount_amount += $item_disc;
        $tax_amount += $item['tax_amount'];
        $total_amount += $item['total_amount'];
    }

    $stmt = $conn->prepare("UPDATE orders SET sub_total = ?, discount_amount = ?, tax_amount = ?, total_amount = ? WHERE id = ?");
    $stmt->execute([$sub_total, $discount_amount, $tax_amount, $total_amount, $order_id]);
}
?>

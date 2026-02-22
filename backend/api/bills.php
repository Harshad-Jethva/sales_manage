<?php
require_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

// Ensure uploads directory exists
$upload_dir = '../uploads/bills/';
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

// Self-healing database check
function healBillsTable($conn) {
    return; // Disabled for PostgreSQL
    try {
        // 1. Ensure 'bills' table exists
        $conn->exec("CREATE TABLE IF NOT EXISTS bills (id INT AUTO_INCREMENT PRIMARY KEY)");

        // 2. Define required columns and their definitions
        $required_columns = [
            'bill_type'      => "ENUM('purchase', 'sale') NOT NULL DEFAULT 'sale'",
            'customer_id'    => "INT NULL",
            'supplier_id'    => "INT NULL",
            'bill_number'    => "VARCHAR(50) UNIQUE",
            'sub_total'      => "DECIMAL(15, 2) NOT NULL DEFAULT 0.00",
            'discount_amount'=> "DECIMAL(15, 2) DEFAULT 0.00",
            'tax_amount'     => "DECIMAL(15, 2) DEFAULT 0.00",
            'total_amount'   => "DECIMAL(15, 2) NOT NULL DEFAULT 0.00",
            'paid_amount'    => "DECIMAL(15, 2) DEFAULT 0.00",
            'payment_method' => "VARCHAR(50) DEFAULT 'Cash'",
            'status'         => "ENUM('pending', 'partial', 'paid') DEFAULT 'pending'",
            'bill_date'      => "DATE NOT NULL",
            'bill_image'     => "VARCHAR(255) NULL",
            'notes'          => "TEXT",
            'created_at'     => "TIMESTAMP DEFAULT CURRENT_TIMESTAMP"
        ];

        // 3. Get existing columns
        $existing_columns = $conn->query("DESCRIBE bills")->fetchAll(PDO::FETCH_COLUMN);

        // 4. Add missing columns one by one
        foreach ($required_columns as $col => $definition) {
            if (!in_array($col, $existing_columns)) {
                $conn->exec("ALTER TABLE bills ADD COLUMN $col $definition");
            }
        }

        // 5. Ensure bill_items table exists
        $conn->exec("CREATE TABLE IF NOT EXISTS bill_items (id INT AUTO_INCREMENT PRIMARY KEY)");
        
        $item_columns = [
            'bill_id'                  => "INT",
            'product_id'               => "INT NULL",
            'item_code'                => "VARCHAR(100) NULL", // New
            'barcode'                  => "VARCHAR(100) NULL", // New
            'item_name'                => "VARCHAR(255) NOT NULL",
            'mrp'                      => "DECIMAL(15, 2) DEFAULT 0.00",
            'regular_discount_percent' => "DECIMAL(5, 2) DEFAULT 0.00",
            'special_discount_percent' => "DECIMAL(5, 2) DEFAULT 0.00",
            'gst_percent'              => "DECIMAL(5, 2) DEFAULT 0.00", // New
            'price_after_discount'     => "DECIMAL(15, 2) NOT NULL", // This is "Product Cost" (Unit Cost)
            'selling_price'            => "DECIMAL(15, 2) DEFAULT 0.00", // New (Unit Selling Price)
            'quantity'                 => "DECIMAL(15, 2) NOT NULL",
            'total'                    => "DECIMAL(15, 2) NOT NULL", // Total Product Cost
            'total_selling_price'      => "DECIMAL(15, 2) DEFAULT 0.00" // New
        ];

        $existing_item_cols = $conn->query("DESCRIBE bill_items")->fetchAll(PDO::FETCH_COLUMN);
        foreach ($item_columns as $col => $definition) {
            if (!in_array($col, $existing_item_cols)) {
                $conn->exec("ALTER TABLE bill_items ADD COLUMN $col $definition");
            }
        }
        
        // Final Fix: Ensure decimal support
        $conn->exec("ALTER TABLE bill_items MODIFY COLUMN quantity DECIMAL(15, 2) NOT NULL");

    } catch(Exception $e) {
        // Silently handle
    }
}

// healBillsTable($conn);

switch($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $id = $_GET['id'];
            $stmt = $conn->prepare("SELECT b.*, 
                             c.name as customer_name, 
                             c.shop_name,
                             c.phone as customer_phone,
                             c.gstin as customer_gstin,
                             c.address as customer_address,
                             c.city as customer_city,
                             s.supplier_name 
                      FROM bills b 
                      LEFT JOIN clients c ON b.customer_id = c.id 
                      LEFT JOIN suppliers s ON b.supplier_id = s.id 
                      WHERE b.id = ?");
            $stmt->execute([$id]);
            $bill = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($bill) {
                $itemsStmt = $conn->prepare("SELECT * FROM bill_items WHERE bill_id = ?");
                $itemsStmt->execute([$id]);
                $bill['items'] = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);
            }
            echo json_encode($bill);
        } else {
            $customer_id = isset($_GET['customer_id']) ? $_GET['customer_id'] : null;
            $whereClause = "";
            $params = [];
            
            if ($customer_id) {
                $whereClause = "WHERE b.customer_id = ?";
                $params[] = $customer_id;
            }

            $query = "SELECT b.*, 
                             c.name as customer_name, 
                             c.shop_name,
                             s.supplier_name 
                      FROM bills b 
                      LEFT JOIN clients c ON b.customer_id = c.id 
                      LEFT JOIN suppliers s ON b.supplier_id = s.id 
                      $whereClause
                      ORDER BY b.bill_date DESC";
            
            $stmt = $conn->prepare($query);
            $stmt->execute($params);
            $bills = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($bills);
        }
        break;

    case 'POST':
        $bill_type = $_POST['bill_type'] ?? 'sale';
        $customer_id = !empty($_POST['customer_id']) ? $_POST['customer_id'] : null;
        $supplier_id = !empty($_POST['supplier_id']) ? $_POST['supplier_id'] : null;
        $bill_number = $_POST['bill_number'] ?? ('TXN-' . time());
        $sub_total = $_POST['sub_total'] ?? 0;
        $discount_amount = $_POST['discount_amount'] ?? 0;
        $tax_amount = $_POST['tax_amount'] ?? 0;
        $total_amount = $_POST['total_amount'] ?? 0;
        $paid_amount = $_POST['paid_amount'] ?? 0;
        $payment_method = $_POST['payment_method'] ?? 'Cash';
        $bill_date = $_POST['bill_date'] ?? date('Y-m-d');
        $notes = $_POST['notes'] ?? '';
        
        $status = 'pending';
        if ($paid_amount >= $total_amount) $status = 'paid';
        elseif ($paid_amount > 0) $status = 'partial';

        $bill_image = '';
        if (isset($_FILES['bill_image'])) {
            $file_name = time() . '_' . $_FILES['bill_image']['name'];
            if (move_uploaded_file($_FILES['bill_image']['tmp_name'], $upload_dir . $file_name)) {
                $bill_image = 'uploads/bills/' . $file_name;
            }
        }

        try {
            $conn->beginTransaction();

            $stmt = $conn->prepare("INSERT INTO bills (bill_type, customer_id, supplier_id, bill_number, sub_total, discount_amount, tax_amount, total_amount, paid_amount, status, payment_method, bill_date, bill_image, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$bill_type, $customer_id, $supplier_id, $bill_number, $sub_total, $discount_amount, $tax_amount, $total_amount, $paid_amount, $status, $payment_method, $bill_date, $bill_image, $notes]);
            
            $bill_id = $conn->lastInsertId('bills_id_seq');
            
            if (isset($_POST['items'])) {
                $items = json_decode($_POST['items'], true);
                foreach ($items as $item) {
                    $item_name = !empty($item['name']) ? $item['name'] : 'Unknown Item';
                    $qty = !empty($item['quantity']) ? (float)$item['quantity'] : 0;
                    $mrp = (float)($item['mrp'] ?? 0);
                    $reg_disc = (float)($item['regular_discount'] ?? 0);
                    $spec_disc = (float)($item['special_discount'] ?? 0);
                    $gst_percent = (float)($item['gst'] ?? 0);
                    
                    $price_after = (float)($item['price'] ?? 0); // This maps to Product Cost
                    $selling_price = (float)($item['selling_price'] ?? 0); // This maps to Selling Price
                    
                    $row_total = (float)($item['total'] ?? ($qty * $price_after)); // Total Product Cost
                    $total_selling = (float)($item['total_selling_price'] ?? ($qty * $selling_price)); // Total Selling Price
                    
                    $prod_id = !empty($item['product_id']) ? $item['product_id'] : null;
                    $item_code = !empty($item['item_code']) ? $item['item_code'] : '';
                    $barcode = !empty($item['barcode']) ? $item['barcode'] : '';

                    // AUTO-SYNC: If product_id is missing, try to find by name or create new
                    if (!$prod_id && !empty($item_name)) {
                        $check_prod = $conn->prepare("SELECT id FROM products WHERE name = ? LIMIT 1");
                        $check_prod->execute([$item_name]);
                        $found = $check_prod->fetch();
                        
                        if ($found) {
                            $prod_id = $found['id'];
                        } else {
                            // Create new product if it doesn't exist
                            $sku = !empty($item_code) ? $item_code : ('AUTO-' . strtoupper(substr(uniqid(), -5)));
                            $ins_prod = $conn->prepare("INSERT INTO products (name, sku, barcode, mrp, purchase_price, sale_price, stock_quantity, gst_percent) VALUES (?, ?, ?, ?, ?, ?, 0, ?)");
                            $ins_prod->execute([$item_name, $sku, $barcode, $mrp, $price_after, $selling_price, $gst_percent]);
                            $prod_id = $conn->lastInsertId('products_id_seq');
                        }
                    }

                    // Record the bill item
                    $item_stmt = $conn->prepare("INSERT INTO bill_items (bill_id, product_id, item_code, barcode, item_name, mrp, regular_discount_percent, special_discount_percent, gst_percent, price_after_discount, selling_price, quantity, total, total_selling_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                    $item_stmt->execute([$bill_id, $prod_id, $item_code, $barcode, $item_name, $mrp, $reg_disc, $spec_disc, $gst_percent, $price_after, $selling_price, $qty, $row_total, $total_selling]);
                    
                    // UPDATE STOCK: Logic depends on bill_type
                    if ($prod_id) {
                        if ($bill_type === 'sale') {
                            // For Sale: Decrement stock
                            $update_stock = $conn->prepare("UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?");
                            $update_stock->execute([$qty, $prod_id]);
                        } else {
                            // For Purchase: Increment stock and update prices
                            $update_stock = $conn->prepare("UPDATE products SET stock_quantity = stock_quantity + ?, purchase_price = ?, sale_price = ?, gst_percent = ?, sku = COALESCE(NULLIF(?, ''), sku), barcode = COALESCE(NULLIF(?, ''), barcode) WHERE id = ?");
                            $update_stock->execute([$qty, $price_after, $selling_price, $gst_percent, $item_code, $barcode, $prod_id]);
                        }
                    }
                }
            }
            
            $conn->commit();
            echo json_encode(["success" => true, "message" => "Transaction completed", "id" => $bill_id]);
        } catch (Exception $e) {
            $conn->rollBack();
            echo json_encode(["success" => false, "error" => $e->getMessage()]);
        }

        break;
}
?>

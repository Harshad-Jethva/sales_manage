<?php
require_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

// Self-healing: Create products table and ensure columns exist
function healProducts($conn) {
    // 1. Ensure table exists
    $sql = "CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        sku VARCHAR(100) UNIQUE,
        barcode VARCHAR(100) UNIQUE,
        mrp DECIMAL(15, 2) NOT NULL,
        purchase_price DECIMAL(15, 2) DEFAULT 0.00,
        sale_price DECIMAL(15, 2) NOT NULL,
        gst_percent DECIMAL(5, 2) DEFAULT 0.00,
        stock_quantity INT DEFAULT 0,
        unit VARCHAR(20) DEFAULT 'pcs',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    $conn->exec($sql);

    // 2. Add missing columns dynamically
    $columns = [
        'barcode' => "VARCHAR(100) UNIQUE",
        'gst_percent' => "DECIMAL(5, 2) DEFAULT 0.00",
        'sku' => "VARCHAR(100) UNIQUE"
    ];

    try {
        $existing = $conn->query("DESCRIBE products")->fetchAll(PDO::FETCH_COLUMN);
        foreach ($columns as $col => $def) {
            if (!in_array($col, $existing)) {
                $conn->exec("ALTER TABLE products ADD COLUMN $col $def");
            }
        }
    } catch (Exception $e) { /* silent fail */ }
}

// healProducts($conn);

switch($method) {
    case 'GET':
        $stmt = $conn->query("SELECT * FROM products ORDER BY name ASC");
        echo json_encode($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if(!empty($data['name'])) {
            $stmt = $conn->prepare("INSERT INTO products (name, sku, mrp, purchase_price, sale_price, stock_quantity, unit) VALUES (?, ?, ?, ?, ?, ?, ?)");
            if($stmt->execute([
                $data['name'], 
                $data['sku'] ?? '', 
                $data['mrp'], 
                $data['purchase_price'] ?? 0, 
                $data['sale_price'], 
                $data['stock_quantity'] ?? 0,
                $data['unit'] ?? 'pcs'
            ])) {
                echo json_encode(["success" => true, "message" => "Product added", "id" => $conn->lastInsertId('products_id_seq')]);
            } else {
                echo json_encode(["success" => false, "error" => "Failed to add product"]);
            }
        }
        break;
}
?>

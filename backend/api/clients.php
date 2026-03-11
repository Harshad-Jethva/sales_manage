<?php
require_once '../config/db.php';

// Self-healing: Create table if missing & ensure all columns exist
function healClients($conn) {
    // 1. Ensure table exists
    $sql = "CREATE TABLE IF NOT EXISTS clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(255),
        address TEXT,
        company VARCHAR(255),
        type VARCHAR(50) DEFAULT 'Retail',
        
        shop_name VARCHAR(255),
        gstin VARCHAR(20),
        pan VARCHAR(20),
        billing_address TEXT,
        shipping_address TEXT,
        website VARCHAR(255),
        contact_person VARCHAR(255),
        notes TEXT,
        
        bank_name VARCHAR(255),
        account_number VARCHAR(50),
        ifsc_code VARCHAR(20),
        
        city VARCHAR(100),
        area VARCHAR(150),
        state VARCHAR(100),
        pincode VARCHAR(10),
        credit_limit DECIMAL(15,2) DEFAULT 0.00,
        
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";
    $conn->exec($sql);

    // 2. Add missing columns dynamically
    $columns = [
        'shop_name' => "VARCHAR(255)",
        'gstin' => "VARCHAR(20)",
        'pan' => "VARCHAR(20)",
        'billing_address' => "TEXT",
        'shipping_address' => "TEXT",
        'website' => "VARCHAR(255)",
        'contact_person' => "VARCHAR(255)",
        'notes' => "TEXT",
        'bank_name' => "VARCHAR(255)",
        'account_number' => "VARCHAR(50)",
        'ifsc_code' => "VARCHAR(20)",
        'city' => "VARCHAR(100)",
        'area' => "VARCHAR(150)",
        'state' => "VARCHAR(100)",
        'pincode' => "VARCHAR(10)",
        'credit_limit' => "DECIMAL(15,2) DEFAULT 0.00",
        'type' => "VARCHAR(50) DEFAULT 'Retail'"
    ];

    try {
        $existing = $conn->query("DESCRIBE clients")->fetchAll(PDO::FETCH_COLUMN);
        foreach ($columns as $col => $def) {
            if (!in_array($col, $existing)) {
                $conn->exec("ALTER TABLE clients ADD COLUMN $col $def");
            }
        }
    } catch (Exception $e) { /* silent fail */ }
}

// healClients($conn);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $stmt = $conn->prepare("SELECT *, type as customer_type FROM clients WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            $client = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $client]);
        } else {
            $stmt = $conn->query("SELECT *, type as customer_type FROM clients ORDER BY created_at DESC");
            $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $clients]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if(!empty($data['name'])) {
            $stmt = $conn->prepare("INSERT INTO clients (
                name, phone, email, address, company, type,
                shop_name, gstin, pan, billing_address, shipping_address,
                website, contact_person, notes, bank_name, account_number, ifsc_code,
                city, area, state, pincode, credit_limit, status, outstanding_balance
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            
            $params = [
                $data['name'], 
                $data['phone'] ?? '', 
                $data['email'] ?? '', 
                $data['address'] ?? '',
                $data['company'] ?? '',
                $data['customer_type'] ?? 'Regular',
                $data['shop_name'] ?? '',
                $data['gstin'] ?? '',
                $data['pan'] ?? '',
                $data['billing_address'] ?? '',
                $data['shipping_address'] ?? '',
                $data['website'] ?? '',
                $data['contact_person'] ?? '',
                $data['notes'] ?? '',
                $data['bank_name'] ?? '',
                $data['account_number'] ?? '',
                $data['ifsc_code'] ?? '',
                $data['city'] ?? '',
                $data['area'] ?? '',
                $data['state'] ?? '',
                $data['pincode'] ?? '',
                $data['credit_limit'] ?? 0.00,
                $data['status'] ?? 'active',
                $data['outstanding_balance'] ?? 0.00
            ];
            
            if($stmt->execute($params)) {
                echo json_encode(["success" => true, "message" => "Client added", "id" => $conn->lastInsertId('clients_id_seq')]);
            } else {
                echo json_encode(["success" => false, "error" => "Failed to add client"]);
            }
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if(!empty($data['id']) && !empty($data['name'])) {
            $stmt = $conn->prepare("UPDATE clients SET 
                name=?, phone=?, email=?, address=?, company=?, type=?,
                shop_name=?, gstin=?, pan=?, billing_address=?, shipping_address=?,
                website=?, contact_person=?, notes=?, bank_name=?, account_number=?, ifsc_code=?,
                city=?, area=?, state=?, pincode=?, credit_limit=?, status=?, outstanding_balance=?
                WHERE id=?");
            
            $params = [
                $data['name'], 
                $data['phone'] ?? '', 
                $data['email'] ?? '', 
                $data['address'] ?? '',
                $data['company'] ?? '',
                $data['customer_type'] ?? 'Regular',
                $data['shop_name'] ?? '',
                $data['gstin'] ?? '',
                $data['pan'] ?? '',
                $data['billing_address'] ?? '',
                $data['shipping_address'] ?? '',
                $data['website'] ?? '',
                $data['contact_person'] ?? '',
                $data['notes'] ?? '',
                $data['bank_name'] ?? '',
                $data['account_number'] ?? '',
                $data['ifsc_code'] ?? '',
                $data['city'] ?? '',
                $data['area'] ?? '',
                $data['state'] ?? '',
                $data['pincode'] ?? '',
                $data['credit_limit'] ?? 0.00,
                $data['status'] ?? 'active',
                $data['outstanding_balance'] ?? 0.00,
                $data['id']
            ];
            
            if($stmt->execute($params)) {
                echo json_encode(["success" => true, "message" => "Client updated"]);
            } else {
                echo json_encode(["success" => false, "error" => "Failed to update client"]);
            }
        } else {
            echo json_encode(["success" => false, "error" => "Invalid data"]);
        }
        break;

    case 'DELETE':
        $data = json_decode(file_get_contents("php://input"), true);
        // support both body data and query param
        $id = $data['id'] ?? $_GET['id'] ?? null;
        
        if($id) {
            $stmt = $conn->prepare("DELETE FROM clients WHERE id = ?");
            if($stmt->execute([$id])) {
                echo json_encode(["success" => true, "message" => "Client deleted"]);
            } else {
                echo json_encode(["success" => false, "error" => "Failed to delete client"]);
            }
        } else {
            echo json_encode(["success" => false, "error" => "ID required"]);
        }
        break;
}
?>

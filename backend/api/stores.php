<?php
require_once '../config/db.php';

// Self-healing: Create table if missing
function healSuppliers($conn) {
    $sql = "CREATE TABLE IF NOT EXISTS suppliers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        supplier_name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255),
        phone VARCHAR(20),
        email VARCHAR(255),
        address TEXT,
        gst_number VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $conn->exec($sql);
}

healSuppliers($conn);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        $stmt = $conn->query("SELECT * FROM suppliers ORDER BY supplier_name ASC");
        echo json_encode($stmt->fetchAll());
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if(!empty($data['supplier_name'])) {
            $stmt = $conn->prepare("INSERT INTO suppliers (supplier_name, contact_person, phone, email, address, gst_number) VALUES (?, ?, ?, ?, ?, ?)");
            $result = $stmt->execute([
                $data['supplier_name'],
                $data['contact_person'] ?? '',
                $data['phone'] ?? '',
                $data['email'] ?? '',
                $data['address'] ?? '',
                $data['gst_number'] ?? ''
            ]);

            if($result) {
                echo json_encode(["success" => true, "message" => "Supplier added", "id" => $conn->lastInsertId('suppliers_id_seq')]);
            } else {
                echo json_encode(["success" => false, "error" => "Failed to add supplier"]);
            }
        } else {
            echo json_encode(["success" => false, "error" => "Supplier name is required"]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if(!empty($data['id'])) {
            $fields = [];
            $params = [];
            
            if(isset($data['supplier_name'])) { $fields[] = "supplier_name=?"; $params[] = $data['supplier_name']; }
            if(isset($data['contact_person'])) { $fields[] = "contact_person=?"; $params[] = $data['contact_person']; }
            if(isset($data['phone'])) { $fields[] = "phone=?"; $params[] = $data['phone']; }
            if(isset($data['email'])) { $fields[] = "email=?"; $params[] = $data['email']; }
            if(isset($data['address'])) { $fields[] = "address=?"; $params[] = $data['address']; }
            if(isset($data['gst_number'])) { $fields[] = "gst_number=?"; $params[] = $data['gst_number']; }
            
            $params[] = $data['id']; // For WHERE clause

            if(count($fields) > 0) {
                $sql = "UPDATE suppliers SET " . implode(", ", $fields) . " WHERE id=?";
                $stmt = $conn->prepare($sql);
                if($stmt->execute($params)) {
                    echo json_encode(["success" => true, "message" => "Supplier updated"]);
                } else {
                    echo json_encode(["success" => false, "error" => "Failed to update supplier"]);
                }
            } else {
                echo json_encode(["success" => false, "error" => "No fields to update"]);
            }
        } else {
            echo json_encode(["success" => false, "error" => "ID is required"]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if($id) {
            $stmt = $conn->prepare("DELETE FROM suppliers WHERE id=?");
            if($stmt->execute([$id])) {
                echo json_encode(["success" => true, "message" => "Supplier deleted"]);
            } else {
                echo json_encode(["success" => false, "error" => "Failed to delete supplier"]);
            }
        } else {
            echo json_encode(["success" => false, "error" => "ID is required"]);
        }
        break;
}
?>

<?php
require_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $stmt = $conn->prepare("SELECT * FROM suppliers WHERE id = ?");
            $stmt->execute([$_GET['id']]);
            $supplier = $stmt->fetch(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $supplier]);
        } else {
            $stmt = $conn->query("SELECT * FROM suppliers ORDER BY created_at DESC");
            $suppliers = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $suppliers]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if(!empty($data['supplier_name'])) {
            $stmt = $conn->prepare("INSERT INTO suppliers (
                supplier_name, contact_person, phone, email, gst_number, pan_number, 
                address, city, state, credit_period_days, status, total_purchase_amount, 
                outstanding_payable_amount
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            
            $params = [
                $data['supplier_name'], 
                $data['contact_person'] ?? '', 
                $data['phone'] ?? '', 
                $data['email'] ?? '',
                $data['gst_number'] ?? '',
                $data['pan_number'] ?? '',
                $data['address'] ?? '',
                $data['city'] ?? '',
                $data['state'] ?? '',
                $data['credit_period_days'] ?? 30,
                $data['status'] ?? 'active',
                $data['total_purchase_amount'] ?? 0.00,
                $data['outstanding_payable_amount'] ?? 0.00
            ];
            
            if($stmt->execute($params)) {
                echo json_encode(["success" => true, "message" => "Supplier added", "id" => $conn->lastInsertId('suppliers_id_seq')]);
            } else {
                echo json_encode(["success" => false, "error" => "Failed to add supplier"]);
            }
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents("php://input"), true);
        if(!empty($data['id']) && !empty($data['supplier_name'])) {
            $stmt = $conn->prepare("UPDATE suppliers SET 
                supplier_name=?, contact_person=?, phone=?, email=?, gst_number=?, pan_number=?, 
                address=?, city=?, state=?, credit_period_days=?, status=?, total_purchase_amount=?, 
                outstanding_payable_amount=?
                WHERE id=?");
            
            $params = [
                $data['supplier_name'], 
                $data['contact_person'] ?? '', 
                $data['phone'] ?? '', 
                $data['email'] ?? '',
                $data['gst_number'] ?? '',
                $data['pan_number'] ?? '',
                $data['address'] ?? '',
                $data['city'] ?? '',
                $data['state'] ?? '',
                $data['credit_period_days'] ?? 30,
                $data['status'] ?? 'active',
                $data['total_purchase_amount'] ?? 0.00,
                $data['outstanding_payable_amount'] ?? 0.00,
                $data['id']
            ];
            
            if($stmt->execute($params)) {
                echo json_encode(["success" => true, "message" => "Supplier updated"]);
            } else {
                echo json_encode(["success" => false, "error" => "Failed to update supplier"]);
            }
        } else {
            echo json_encode(["success" => false, "error" => "Invalid data"]);
        }
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? json_decode(file_get_contents("php://input"), true)['id'] ?? null;
        if($id) {
            $stmt = $conn->prepare("DELETE FROM suppliers WHERE id = ?");
            if($stmt->execute([$id])) {
                echo json_encode(["success" => true, "message" => "Supplier deleted"]);
            } else {
                echo json_encode(["success" => false, "error" => "Failed to delete supplier"]);
            }
        } else {
            echo json_encode(["success" => false, "error" => "ID required"]);
        }
        break;
}
?>

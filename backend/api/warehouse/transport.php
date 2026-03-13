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
    case 'DELETE':
        handleDelete($conn);
        break;
    default:
        echo json_encode(["success" => false, "message" => "Method not allowed"]);
        break;
}

function handleGet($conn) {
    try {
        if (isset($_GET['action']) && $_GET['action'] === 'get_reports') {
            handleReports($conn);
            return;
        }

        $query = "SELECT tb.*, t.transport_name, t.driver_name, t.driver_mobile, t.vehicle_number, 
                         t.transport_type, t.dispatch_date, t.destination_city,
                         c.name as client_name, o.order_number
                  FROM transport_builty tb
                  JOIN transports t ON tb.transport_id = t.id
                  JOIN clients c ON tb.client_id = c.id
                  LEFT JOIN orders o ON tb.order_id = o.id
                  WHERE 1=1";
        $params = [];

        if (isset($_GET['start_date']) && !empty($_GET['start_date'])) {
            $query .= " AND t.dispatch_date >= ?";
            $params[] = $_GET['start_date'];
        }
        if (isset($_GET['end_date']) && !empty($_GET['end_date'])) {
            $query .= " AND t.dispatch_date <= ?";
            $params[] = $_GET['end_date'];
        }
        if (isset($_GET['client_name']) && !empty($_GET['client_name'])) {
            $query .= " AND c.name ILIKE ?";
            $params[] = "%" . $_GET['client_name'] . "%";
        }
        if (isset($_GET['transport_name']) && !empty($_GET['transport_name'])) {
            $query .= " AND t.transport_name ILIKE ?";
            $params[] = "%" . $_GET['transport_name'] . "%";
        }

        $query .= " ORDER BY tb.created_at DESC";

        $stmt = $conn->prepare($query);
        $stmt->execute($params);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(["success" => true, "data" => $data]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}

function handlePost($conn) {
    try {
        $conn->beginTransaction();

        // 1. Save to transports table
        $stmt = $conn->prepare("INSERT INTO transports (transport_name, driver_name, driver_mobile, vehicle_number, transport_type, dispatch_date, destination_city) 
                                VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $_POST['transport_name'] ?? '',
            $_POST['driver_name'] ?? '',
            $_POST['driver_mobile'] ?? '',
            $_POST['vehicle_number'] ?? '',
            $_POST['transport_type'] ?? '',
            $_POST['dispatch_date'] ?? date('Y-m-d'),
            $_POST['destination_city'] ?? ''
        ]);
        $transport_id = $conn->lastInsertId('transports_id_seq');

        // 2. Handle File Upload
        $builty_path = '';
        if (isset($_FILES['builty_document']) && $_FILES['builty_document']['error'] === UPLOAD_ERR_OK) {
            $upload_dir = '../../uploads/builty/';
            if (!is_dir($upload_dir)) {
                mkdir($upload_dir, 0777, true);
            }
            $filename = time() . '_' . basename($_FILES['builty_document']['name']);
            $target_file = $upload_dir . $filename;
            if (move_uploaded_file($_FILES['builty_document']['tmp_name'], $target_file)) {
                $builty_path = '/uploads/builty/' . $filename;
            }
        }

        // 3. Save to transport_builty table
        $builty_number = $_POST['builty_number'] ?? 'BN-' . time();
        $stmt = $conn->prepare("INSERT INTO transport_builty (transport_id, client_id, order_id, builty_number, builty_document_path) 
                                VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([
            $transport_id,
            $_POST['client_id'] ?? null,
            (!empty($_POST['order_id']) && $_POST['order_id'] !== 'null') ? $_POST['order_id'] : null,
            $builty_number,
            $builty_path
        ]);
        $builty_id = $conn->lastInsertId('transport_builty_id_seq');

        $conn->commit();

        // Trigger PDF Generation & WhatsApp (Optional call to automation)
        $automation_url = 'http://localhost:5000/send-transport-whatsapp';
        $ch = curl_init($automation_url);
        $payload = json_encode(['builty_id' => $builty_id]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5); 
        $result = curl_exec($ch);
        curl_close($ch);

        echo json_encode(["success" => true, "message" => "Transport record saved successfully", "builty_id" => $builty_id, "automation_response" => json_decode($result, true)]);
    } catch (Exception $e) {
        if ($conn->inTransaction()) {
            $conn->rollBack();
        }
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}

function handleReports($conn) {
    try {
        $total_shipments = $conn->query("SELECT COUNT(*) FROM transport_builty")->fetchColumn();
        
        $transport_wise = $conn->query("SELECT t.transport_name, COUNT(*) as count 
                                      FROM transport_builty tb 
                                      JOIN transports t ON tb.transport_id = t.id 
                                      GROUP BY t.transport_name")->fetchAll(PDO::FETCH_ASSOC);
                                      
        $client_wise = $conn->query("SELECT c.name as client_name, COUNT(*) as count 
                                   FROM transport_builty tb 
                                   JOIN clients c ON tb.client_id = c.id 
                                   GROUP BY c.name")->fetchAll(PDO::FETCH_ASSOC);
                                   
        $route_summary = $conn->query("SELECT destination_city, COUNT(*) as count 
                                     FROM transports 
                                     GROUP BY destination_city")->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "data" => [
                "total_shipments" => $total_shipments,
                "transport_wise" => $transport_wise,
                "client_wise" => $client_wise,
                "route_summary" => $route_summary
            ]
        ]);
    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}

function handleDelete($conn) {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        echo json_encode(["success" => false, "message" => "ID required"]);
        return;
    }

    try {
        // Get file path before deleting
        $stmt = $conn->prepare("SELECT tb.builty_document_path FROM transport_builty tb WHERE tb.id = ?");
        $stmt->execute([$id]);
        $res = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($res && $res['builty_document_path']) {
            $file = '../../' . $res['builty_document_path'];
            if (file_exists($file)) unlink($file);
        }

        // Deleting transport_builty will cascade to transport table? 
        // Actually transport_id in transport_builty has ON DELETE CASCADE. 
        // But we want to delete the transport record itself.
        
        $stmt = $conn->prepare("SELECT transport_id FROM transport_builty WHERE id = ?");
        $stmt->execute([$id]);
        $tid = $stmt->fetchColumn();

        if ($tid) {
            $stmt = $conn->prepare("DELETE FROM transports WHERE id = ?");
            $stmt->execute([$tid]);
        }

        echo json_encode(["success" => true, "message" => "Record deleted successfully"]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
}
?>

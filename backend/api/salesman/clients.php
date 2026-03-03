<?php
require_once '../../config/db.php';

try {
    $search = isset($_GET['search']) ? $_GET['search'] : '';

    $query = "SELECT id, name, company, phone, city FROM clients WHERE 1=1";
    $params = [];

    if (!empty($search)) {
        $query .= " AND (name ILIKE ? OR company ILIKE ? OR phone ILIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }

    $query .= " ORDER BY name ASC";

    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "data" => $clients]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>

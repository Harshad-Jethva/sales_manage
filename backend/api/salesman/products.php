<?php
require_once '../../config/db.php';

try {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    $search = isset($_GET['search']) ? $_GET['search'] : '';
    $category = isset($_GET['category']) ? $_GET['category'] : '';

    if ($id) {
        $stmt = $conn->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->execute([$id]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($product) {
            echo json_encode(["success" => true, "data" => $product]);
        } else {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Product not found"]);
        }
        exit;
    }

    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
    $offset = ($page - 1) * $limit;

    $sort_by = isset($_GET['sort_by']) ? $_GET['sort_by'] : 'name';
    $sort_order = isset($_GET['sort_order']) && strtolower($_GET['sort_order']) === 'desc' ? 'DESC' : 'ASC';

    $allowed_sort_columns = ['name', 'sale_price', 'stock_quantity'];
    if (!in_array($sort_by, $allowed_sort_columns)) {
        $sort_by = 'name';
    }

    $query = "SELECT * FROM products WHERE 1=1";
    $countQuery = "SELECT COUNT(*) as total FROM products WHERE 1=1";
    $params = [];

    if (!empty($search)) {
        $searchCondition = " AND (name ILIKE ? OR sku ILIKE ?)";
        $query .= $searchCondition;
        $countQuery .= $searchCondition;
        $params[] = "%$search%";
        $params[] = "%$search%";
    }

    if (!empty($category)) {
        $categoryCondition = " AND category = ?";
        $query .= $categoryCondition;
        $countQuery .= $categoryCondition;
        $params[] = $category;
    }

    $query .= " ORDER BY $sort_by $sort_order LIMIT $limit OFFSET $offset";

    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $countStmt = $conn->prepare($countQuery);
    $countStmt->execute($params);
    $totalRow = $countStmt->fetch(PDO::FETCH_ASSOC);
    $total = $totalRow ? (int)$totalRow['total'] : 0;
    
    $totalPages = ceil($total / $limit);

    echo json_encode([
        "success" => true, 
        "data" => $products,
        "pagination" => [
            "current_page" => $page,
            "total_pages" => $totalPages,
            "total_items" => $total,
            "limit" => $limit
        ]
    ]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>

<?php
require_once '../config/db.php';
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$action = $_GET['action'] ?? '';

if ($action === 'update' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $rawData = file_get_contents("php://input");
    $data = json_decode($rawData);
    $salesman_id = $data->salesman_id ?? null; // Optionally check token instead
    $lat = $data->latitude ?? null;
    $lng = $data->longitude ?? null;
    $acc = $data->accuracy ?? null;
    
    if ($salesman_id && $lat && $lng) {
        try {
            $stmt = $conn->prepare("INSERT INTO salesman_locations (salesman_id, latitude, longitude, accuracy, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)");
            if ($stmt->execute([$salesman_id, $lat, $lng, $acc])) {
                echo json_encode(['success' => true, 'message' => 'Location updated']);
                exit;
            }
        } catch (PDOException $e) {
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
            exit;
        }
    }
    echo json_encode(['success' => false, 'message' => 'Missing data']);
    exit;
} elseif ($action === 'get_live' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $query = "
            SELECT u.id as salesman_id, u.name as salesman_name, l.latitude, l.longitude, l.updated_at
            FROM users u
            JOIN (
                SELECT salesman_id, MAX(updated_at) as max_time
                FROM salesman_locations
                GROUP BY salesman_id
            ) latest ON u.id = latest.salesman_id
            JOIN salesman_locations l ON latest.salesman_id = l.salesman_id AND latest.max_time = l.updated_at
            WHERE u.role = 'salesman'
        ";
        $stmt = $conn->prepare($query);
        $stmt->execute();
        $locations = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'data' => $locations]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
} elseif ($action === 'get_history' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    $salesman_id = $_GET['salesman_id'] ?? null;
    $date = $_GET['date'] ?? date('Y-m-d');
    
    if (!$salesman_id) {
        echo json_encode(['success' => false, 'message' => 'Salesman ID required']);
        exit;
    }
    
    try {
        $stmt = $conn->prepare("
            SELECT latitude, longitude, updated_at 
            FROM salesman_locations 
            WHERE salesman_id = ? AND DATE(updated_at) = ?
            ORDER BY updated_at ASC
        ");
        $stmt->execute([$salesman_id, $date]);
        $locations = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'data' => $locations]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
} elseif ($action === 'get_salesmen' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $stmt = $conn->prepare("
            SELECT id as salesman_id, name as salesman_name 
            FROM users 
            WHERE role = 'salesman'
        ");
        $stmt->execute();
        $salesmen = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'data' => $salesmen]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
} elseif ($action === 'get_reports' && $_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        // Query to get all locations grouped by day and salesman
        $stmt = $conn->prepare("
            SELECT l.salesman_id, u.name as salesman_name, DATE(l.updated_at) as route_date, 
                   l.latitude, l.longitude, l.updated_at
            FROM salesman_locations l
            JOIN users u ON l.salesman_id = u.id
            ORDER BY l.salesman_id, route_date, l.updated_at ASC
        ");
        $stmt->execute();
        $all_locations = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $reports = [];
        $current_group = null;
        
        foreach ($all_locations as $loc) {
            $key = $loc['salesman_id'] . '_' . $loc['route_date'];
            
            if ($current_group !== $key) {
                if ($current_group !== null) {
                    // Finalize previous group
                    $reports[] = $current_data;
                }
                $current_group = $key;
                $current_data = [
                    'salesman_name' => $loc['salesman_name'],
                    'route_date' => $loc['route_date'],
                    'start_time' => $loc['updated_at'],
                    'end_time' => $loc['updated_at'],
                    'start_lat' => $loc['latitude'],
                    'start_lng' => $loc['longitude'],
                    'end_lat' => $loc['latitude'],
                    'end_lng' => $loc['longitude'],
                    'total_distance' => 0,
                    'last_lat' => $loc['latitude'],
                    'last_lng' => $loc['longitude']
                ];
            } else {
                // Update current group
                $current_data['end_time'] = $loc['updated_at'];
                $current_data['end_lat'] = $loc['latitude'];
                $current_data['end_lng'] = $loc['longitude'];
                
                // Calculate distance using Haversine formula
                $lat1 = $current_data['last_lat'];
                $lon1 = $current_data['last_lng'];
                $lat2 = $loc['latitude'];
                $lon2 = $loc['longitude'];
                
                $earth_radius = 6371; // km
                $dLat = deg2rad($lat2 - $lat1);
                $dLon = deg2rad($lon2 - $lon1);
                $a = sin($dLat/2) * sin($dLat/2) + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon/2) * sin($dLon/2);
                $c = 2 * asin(sqrt($a));
                $d = $earth_radius * $c;
                
                $current_data['total_distance'] += $d;
                $current_data['last_lat'] = $lat2;
                $current_data['last_lng'] = $lon2;
            }
        }
        if ($current_group !== null) {
            $reports[] = $current_data;
        }
        
        // Post-process the reports for output formatting
        foreach ($reports as &$report) {
            unset($report['last_lat']);
            unset($report['last_lng']);
            
            $start_dto = new DateTime($report['start_time']);
            $end_dto = new DateTime($report['end_time']);
            $diff = $start_dto->diff($end_dto);
            
            $report['working_hours'] = $diff->format('%h hrs %i mins');
            $report['distance'] = round($report['total_distance'], 2) . ' km';
        }
        
        echo json_encode(['success' => true, 'data' => array_reverse($reports)]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid action']);
}
?>

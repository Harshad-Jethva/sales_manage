<?php
require_once '../config/db.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$type = $_GET['type'] ?? 'overall_stats';

if ($method == 'GET') {
    switch ($type) {
        case 'overall_stats':
            $total_sales = $conn->query("SELECT SUM(total_amount) FROM bills WHERE bill_type = 'sale'")->fetchColumn();
            $total_purchases = $conn->query("SELECT SUM(total_amount) FROM bills WHERE bill_type = 'purchase'")->fetchColumn();
            $total_received = $conn->query("SELECT SUM(paid_amount) FROM bills WHERE bill_type = 'sale'")->fetchColumn();
            $bank_balance = $conn->query("SELECT SUM(balance) FROM bank_accounts")->fetchColumn();
            $receivable = ($total_sales ?? 0) - ($total_received ?? 0);
            
            echo json_encode([
                "total_sales" => $total_sales ?? 0,
                "total_purchases" => $total_purchases ?? 0,
                "total_received" => $total_received ?? 0,
                "total_receivable" => $receivable,
                "bank_balance" => $bank_balance ?? 0
            ]);
            break;

        case 'monthly_trend':
            $sql = "
                SELECT 
                    TO_CHAR(bill_date, 'YYYY-MM') as month,
                    SUM(CASE WHEN bill_type = 'sale' THEN total_amount ELSE 0 END) as sales,
                    SUM(CASE WHEN bill_type = 'purchase' THEN total_amount ELSE 0 END) as expenses
                FROM bills 
                WHERE bill_date >= NOW() - INTERVAL '6 months'
                GROUP BY TO_CHAR(bill_date, 'YYYY-MM')
                ORDER BY month ASC
            ";
            $stmt = $conn->query($sql);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;

        case 'top_clients':
            $sql = "
                SELECT c.name, SUM(b.total_amount) as total_revenue
                FROM bills b
                JOIN clients c ON b.customer_id = c.id
                WHERE b.bill_type = 'sale'
                GROUP BY b.customer_id
                ORDER BY total_revenue DESC
                LIMIT 5
            ";
            $stmt = $conn->query($sql);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;

        case 'top_products':
            try {
                $sql = "
                    SELECT p.name, SUM(bi.quantity) as total_qty, SUM(bi.total) as total_revenue
                    FROM bill_items bi
                    JOIN products p ON bi.product_id = p.id
                    JOIN bills b ON bi.bill_id = b.id
                    WHERE b.bill_type = 'sale'
                    GROUP BY bi.product_id
                    ORDER BY total_revenue DESC
                    LIMIT 5
                ";
                $stmt = $conn->query($sql);
                echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            } catch (Exception $e) {
                echo json_encode([]); 
            }
            break;
            
        case 'pending_payments':
            // Enhanced pending payments logic
            $sql = "
                SELECT 
                    c.id as client_id,
                    c.name as client_name, 
                    c.phone as client_phone, 
                    COUNT(b.id) as pending_bills_count,
                    SUM(b.total_amount) as total_billed,
                    SUM(b.paid_amount) as total_paid,
                    (SUM(b.total_amount) - SUM(b.paid_amount)) as total_remaining
                FROM bills b
                JOIN clients c ON b.customer_id = c.id
                WHERE b.bill_type = 'sale' 
                GROUP BY b.customer_id
                HAVING total_remaining > 0
                ORDER BY total_remaining DESC
            ";
            $stmt = $conn->query($sql);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;
            
        case 'client_pending_details':
            // Fetch detailed pending bills for a specific client
            if (!isset($_GET['client_id'])) {
                echo json_encode([]);
                exit;
            }
            $client_id = $_GET['client_id'];
            $sql = "
                SELECT 
                    id as bill_id, 
                    bill_number, 
                    bill_date, 
                    total_amount, 
                    paid_amount, 
                    (total_amount - paid_amount) as remaining_amount,
                    status
                FROM bills 
                WHERE customer_id = $client_id 
                AND bill_type = 'sale' 
                AND (total_amount - paid_amount) > 0
                ORDER BY bill_date ASC
            ";
            $stmt = $conn->query($sql);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;
        case 'cashier_report':
            $from = $_GET['from'] ?? date('Y-m-d');
            $to = $_GET['to'] ?? date('Y-m-d');
            
            $sql = "
                SELECT 
                    COALESCE(payment_method, 'Other') as payment_method,
                    SUM(total_amount) as total_amount,
                    SUM(paid_amount) as paid_amount,
                    SUM(total_amount - paid_amount) as pending_amount,
                    COUNT(*) as count
                FROM bills 
                WHERE bill_date BETWEEN ? AND ?
                AND bill_type = 'sale'
                GROUP BY payment_method
            ";
            $stmt = $conn->prepare($sql);
            $stmt->execute([$from, $to]);
            $summary = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $bills_sql = "
                SELECT b.*, c.name as customer_name 
                FROM bills b
                LEFT JOIN clients c ON (b.client_id = c.id OR b.customer_id = c.id)
                WHERE b.bill_date BETWEEN ? AND ?
                AND b.bill_type = 'sale'
                ORDER BY b.bill_date DESC, b.id DESC
            ";
            $stmt = $conn->prepare($bills_sql);
            $stmt->execute([$from, $to]);
            $bills = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                "summary" => $summary,
                "bills" => $bills
            ]);
            break;
    }
}
?>

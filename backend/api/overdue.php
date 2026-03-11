<?php
require_once '../config/db.php';

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

header('Content-Type: application/json');

// Check authentication here if needed
// For now, allow requests

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get_overdue':
        getOverdueBills($conn);
        break;
    case 'collect_payment':
        collectPayment($conn);
        break;
    case 'get_history':
        getCollectionHistory($conn);
        break;
    case 'save_receipt_pdf':
        saveReceiptPdf($conn);
        break;
    case 'send_whatsapp':
        sendWhatsapp($conn);
        break;
    default:
        echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
}

function getOverdueBills($conn) {
    try {
        $searchQuery = $_GET['search'] ?? '';
        $dateFilter = $_GET['dateFilter'] ?? '';
        $amountRange = $_GET['amountRange'] ?? '';
        
        $clientInfo = null;
        
        // Base query
        $sql = "
            SELECT 
                b.id as bill_id, 
                b.bill_number, 
                b.bill_date, 
                b.due_date, 
                b.total_amount, 
                b.paid_amount, 
                (b.total_amount - COALESCE(b.paid_amount, 0)) as overdue_amount,
                CURRENT_DATE - b.due_date as days_overdue,
                c.id as client_id, 
                c.name as client_name,
                c.phone as client_phone
            FROM bills b
            JOIN clients c ON b.client_id = c.id
            WHERE LOWER(b.payment_method) = 'credit' 
            AND (b.total_amount - COALESCE(b.paid_amount, 0)) > 0
        ";
        
        $params = [];
        
        if (!empty($searchQuery)) {
            $isNumeric = is_numeric($searchQuery);
            $searchExact = $isNumeric ? (int)$searchQuery : $searchQuery;
            
            $sql .= " AND (c.name ILIKE :search OR CAST(c.id AS TEXT) = :search_exact OR c.id = :search_int)";
            $params[':search'] = '%' . $searchQuery . '%';
            $params[':search_exact'] = (string)$searchQuery;
            $params[':search_int'] = is_numeric($searchQuery) ? (int)$searchQuery : -1;
            
            // Fetch client details to show even if they don't have overdue bills
            $clientSql = "SELECT id, name, phone, email, address, company, outstanding_balance, credit_limit FROM clients WHERE name ILIKE :search OR CAST(id AS TEXT) = :search_exact OR id = :search_int LIMIT 1";
            $clientStmt = $conn->prepare($clientSql);
            $clientStmt->execute([
                ':search' => '%' . $searchQuery . '%',
                ':search_exact' => (string)$searchQuery,
                ':search_int' => is_numeric($searchQuery) ? (int)$searchQuery : -1
            ]);
            $clientInfo = $clientStmt->fetch(PDO::FETCH_ASSOC);
        }
        
        if (!empty($dateFilter)) {
            $sql .= " AND b.due_date <= :date_filter";
            $params[':date_filter'] = $dateFilter;
        }
        
        // Example ranges: 0-1000, 1000-5000, 5000+
        if (!empty($amountRange)) {
            if ($amountRange === '0-1000') {
                $sql .= " AND (b.total_amount - coalesce(b.paid_amount, 0)) <= 1000";
            } elseif ($amountRange === '1000-5000') {
                $sql .= " AND (b.total_amount - coalesce(b.paid_amount, 0)) > 1000 AND (b.total_amount - coalesce(b.paid_amount, 0)) <= 5000";
            } elseif ($amountRange === '5000-10000') {
                $sql .= " AND (b.total_amount - coalesce(b.paid_amount, 0)) > 5000 AND (b.total_amount - coalesce(b.paid_amount, 0)) <= 10000";
            } elseif ($amountRange === '10000+') {
                $sql .= " AND (b.total_amount - coalesce(b.paid_amount, 0)) > 10000";
            }
        }
        
        $sql .= " ORDER BY days_overdue DESC";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['status' => 'success', 'data' => $result, 'client_info' => $clientInfo]);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

function collectPayment($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (empty($data['bill_id']) || empty($data['client_id']) || empty($data['collection_amount']) || empty($data['payment_method'])) {
        echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
        return;
    }
    
    $billId = $data['bill_id'];
    $clientId = $data['client_id'];
    $collectionAmount = (float)$data['collection_amount'];
    $paymentMethod = $data['payment_method'];
    
    try {
        $conn->beginTransaction();
        
        // 1. Get current bill details
        $stmt = $conn->prepare("SELECT total_amount, paid_amount, bill_number FROM bills WHERE id = :id FOR UPDATE");
        $stmt->execute([':id' => $billId]);
        $bill = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$bill) {
            throw new Exception("Bill not found.");
        }

        $stmtClient = $conn->prepare("SELECT name, phone FROM clients WHERE id = :id FOR UPDATE");
        $stmtClient->execute([':id' => $clientId]);
        $clientRecord = $stmtClient->fetch(PDO::FETCH_ASSOC);
        
        $outstandingAmount = $bill['total_amount'] - $bill['paid_amount'];
        if ($collectionAmount > $outstandingAmount) {
            throw new Exception("Collection amount exceeds outstanding amount.");
        }
        
        // 2. Update bill
        $newPaidAmount = $bill['paid_amount'] + $collectionAmount;
        $newOutstanding = $bill['total_amount'] - $newPaidAmount;
        $newStatus = ($newOutstanding <= 0) ? 'paid' : 'partial';
        
        $updateBill = $conn->prepare("UPDATE bills SET paid_amount = :paid, status = :status WHERE id = :id");
        $updateBill->execute([
            ':paid' => $newPaidAmount,
            ':status' => $newStatus,
            ':id' => $billId
        ]);
        
        // 3. Update client outstanding balance
        $updateClient = $conn->prepare("UPDATE clients SET outstanding_balance = GREATEST(outstanding_balance - :amount, 0), total_paid_amount = total_paid_amount + :amount WHERE id = :client_id");
        $updateClient->execute([
            ':amount' => $collectionAmount,
            ':client_id' => $clientId
        ]);
        
        // 4. Generate unique random receipt number (e.g. REC-123456)
        $receiptNumber = 'REC-' . str_pad(rand(1000, 999999), 6, '0', STR_PAD_LEFT);
        $receiptPath = ""; // Will be updated by save_receipt_pdf
        
        $whatsappStatus = 'Pending';
        
        $insertReceipt = $conn->prepare("INSERT INTO collection_receipts (client_id, bill_id, collected_amount, remaining_balance, payment_method, receipt_pdf_path, whatsapp_status, receipt_number) VALUES (:client_id, :bill_id, :amount, :remaining, :method, :path, :w_status, :r_number) RETURNING receipt_id, created_at");
        $insertReceipt->execute([
            ':client_id' => $clientId,
            ':bill_id' => $billId,
            ':amount' => $collectionAmount,
            ':remaining' => $newOutstanding,
            ':method' => $paymentMethod,
            ':path' => $receiptPath,
            ':w_status' => $whatsappStatus,
            ':r_number' => $receiptNumber
        ]);
        $receipt = $insertReceipt->fetch(PDO::FETCH_ASSOC);
        
        $conn->commit();
        
        echo json_encode([
            'status' => 'success', 
            'message' => 'Payment collected successfully.',
            'receipt' => [
                'receipt_id' => $receipt['receipt_id'],
                'receipt_number' => $receiptNumber,
                'client_name' => $clientRecord['name'] ?? '',
                'client_phone' => $clientRecord['phone'] ?? '',
                'bill_number' => $bill['bill_number'],
                'collection_amount' => $collectionAmount,
                'remaining_balance' => $newOutstanding,
                'payment_method' => $paymentMethod,
                'date' => date('Y-m-d', strtotime($receipt['created_at'])),
                'created_at' => $receipt['created_at']
            ]
        ]);
    } catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

function saveReceiptPdf($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (empty($data['receipt_id']) || empty($data['receipt_number']) || empty($data['pdf_base64'])) {
        echo json_encode(['status' => 'error', 'message' => 'Missing parameters for saving PDF']);
        return;
    }

    $receiptId = $data['receipt_id'];
    $receiptNumber = $data['receipt_number'];
    $pdfBase64 = $data['pdf_base64'];

    try {
        // Prepare file path
        $uploadDir = '../uploads/receipts/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        // Clean base64 string
        $pdfBase64 = str_replace('data:application/pdf;base64,', '', $pdfBase64);
        $pdfBase64 = str_replace(' ', '+', $pdfBase64);
        $pdfDecoded = base64_decode($pdfBase64);

        $fileName = $receiptNumber . ".pdf";
        $filePath = $uploadDir . $fileName;

        if (file_put_contents($filePath, $pdfDecoded)) {
            $dbPath = "uploads/receipts/" . $fileName;
            
            $stmt = $conn->prepare("UPDATE collection_receipts SET receipt_pdf_path = :path WHERE receipt_id = :id");
            $stmt->execute([':path' => $dbPath, ':id' => $receiptId]);

            echo json_encode(['status' => 'success', 'message' => 'PDF saved successfully', 'pdf_url' => $dbPath]);
        } else {
            throw new Exception("Failed to save PDF to disk.");
        }
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

function sendWhatsapp($conn) {
    $data = json_decode(file_get_contents("php://input"), true);
    if (empty($data['receipt_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'Missing receipt_id']);
        return;
    }

    $receiptId = $data['receipt_id'];

    try {
        // Call the WhatsApp automation service (Node.js on port 5000)
        $url = 'http://localhost:5000/send-receipt-whatsapp';
        $payload = json_encode(['receipt_id' => $receiptId]);

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode === 200) {
            $resData = json_decode($response, true);
            if ($resData['success']) {
                echo json_encode(['status' => 'success', 'message' => 'Receipt sent via WhatsApp successfully!']);
            } else {
                echo json_encode(['status' => 'error', 'message' => $resData['message'] ?? 'Failed to send WhatsApp via service']);
            }
        } else {
             // Fallback to simulation/error if service is offline
            echo json_encode(['status' => 'error', 'message' => 'WhatsApp automation service is offline (Port 5000)']);
        }
        
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}

function getCollectionHistory($conn) {
    try {
        $searchQuery = $_GET['search'] ?? '';
        
        $sql = "
            SELECT 
                r.receipt_id,
                r.receipt_number,
                r.collected_amount,
                r.remaining_balance,
                r.payment_method,
                r.created_at,
                r.whatsapp_status,
                r.receipt_pdf_path,
                c.name as client_name,
                c.phone as client_phone,
                b.bill_number
            FROM collection_receipts r
            JOIN clients c ON r.client_id = c.id
            JOIN bills b ON r.bill_id = b.id
            WHERE 1=1
        ";
        
        $params = [];
        
        if (!empty($searchQuery)) {
            $sql .= " AND (c.name ILIKE :search OR b.bill_number ILIKE :search OR r.receipt_number ILIKE :search)";
            $params[':search'] = '%' . $searchQuery . '%';
        }
        
        $sql .= " ORDER BY r.created_at DESC";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['status' => 'success', 'data' => $result]);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
?>
